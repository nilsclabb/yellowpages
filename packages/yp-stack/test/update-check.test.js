#!/usr/bin/env node
/**
 * update-check module tests for yp-stack.
 *
 * Covers: version comparison, cache read/write, TTL freshness boundary,
 * snooze level math + TTL, snooze reset on remote-version change,
 * just-upgraded-from read-and-clear, check() composition, CLI handler.
 *
 * Network fetch is stubbed via YP_REMOTE_VERSION_URL pointing at an
 * ephemeral localhost HTTP server.
 *
 * Run: node test/update-check.test.js   (from packages/yp-stack/)
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG = path.resolve(__dirname, "..");

// ── Harness ──

const TESTS = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  TESTS.push({ name, fn });
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

function assertEq(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(
      `${msg}\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`,
    );
  }
}

// ── Per-test state dir ──

const BASE_TMP = path.join(os.tmpdir(), "yp-update-check-test-" + Date.now());
let testCounter = 0;

function freshStateDir() {
  testCounter++;
  const dir = path.join(BASE_TMP, `t${testCounter}`);
  fs.mkdirSync(dir, { recursive: true });
  process.env.YP_STATE_DIR = dir;
  return dir;
}

function cleanup() {
  try {
    fs.rmSync(BASE_TMP, { recursive: true, force: true });
  } catch {}
}

// ── Load module (reads env per-call via stateDir() function) ──

const mod = await import("../src/update-check.js");
const {
  isValidVersion,
  compareVersions,
  snoozeDurationMs,
  readCache,
  writeCache,
  cacheFresh,
  readSnooze,
  writeSnooze,
  clearSnooze,
  bumpSnooze,
  setSnooze,
  snoozeActive,
  readAndClearJustUpgraded,
  writeJustUpgraded,
  fetchRemoteVersion,
  refreshIfStale,
  check,
  runSnoozeCli,
} = mod;

// ── Version helpers ──

test("isValidVersion accepts x.y.z only", () => {
  assert(isValidVersion("1.2.3"), "valid");
  assert(!isValidVersion("1.2"), "two parts");
  assert(!isValidVersion("v1.2.3"), "v prefix");
  assert(!isValidVersion(""), "empty");
  assert(!isValidVersion(null), "null");
});

test("compareVersions orders correctly", () => {
  assertEq(compareVersions("1.0.0", "1.0.0"), 0, "equal");
  assertEq(compareVersions("1.0.1", "1.0.0"), 1, "patch greater");
  assertEq(compareVersions("1.0.0", "1.0.1"), -1, "patch smaller");
  assertEq(compareVersions("2.0.0", "1.99.99"), 1, "major dominates");
  assertEq(compareVersions("1.10.0", "1.9.0"), 1, "numeric not lexicographic");
});

test("snoozeDurationMs maps levels", () => {
  assertEq(snoozeDurationMs(1), 24 * 3600 * 1000, "L1 24h");
  assertEq(snoozeDurationMs(2), 48 * 3600 * 1000, "L2 48h");
  assertEq(snoozeDurationMs(3), 7 * 24 * 3600 * 1000, "L3 7d");
  assertEq(snoozeDurationMs(5), 7 * 24 * 3600 * 1000, "L5 clamps to 7d");
});

// ── Cache round-trip ──

test("cache round-trips UP_TO_DATE entry", () => {
  freshStateDir();
  writeCache({ kind: "UP_TO_DATE", local: "0.5.0", timestamp: 1000 });
  const r = readCache();
  assertEq(r.kind, "UP_TO_DATE", "kind");
  assertEq(r.local, "0.5.0", "local");
  assertEq(r.timestamp, 1000, "timestamp");
});

test("cache round-trips UPGRADE_AVAILABLE entry", () => {
  freshStateDir();
  writeCache({
    kind: "UPGRADE_AVAILABLE",
    local: "0.5.0",
    remote: "0.5.1",
    timestamp: 2000,
  });
  const r = readCache();
  assertEq(r.kind, "UPGRADE_AVAILABLE", "kind");
  assertEq(r.remote, "0.5.1", "remote");
});

test("readCache returns null for missing file", () => {
  freshStateDir();
  assertEq(readCache(), null, "missing file");
});

test("readCache returns null for corrupt entry", () => {
  const dir = freshStateDir();
  fs.writeFileSync(path.join(dir, "last-update-check"), "NONSENSE garbage\n");
  assertEq(readCache(), null, "corrupt parses to null");
});

// ── TTL boundaries ──

test("cacheFresh honors UP_TO_DATE 60-minute TTL", () => {
  const entry = { kind: "UP_TO_DATE", local: "0.5.0", timestamp: 0 };
  assert(cacheFresh(entry, 59 * 60 * 1000), "59 min: fresh");
  assert(!cacheFresh(entry, 60 * 60 * 1000), "60 min: stale");
  assert(!cacheFresh(entry, 120 * 60 * 1000), "well past TTL: stale");
});

test("cacheFresh honors UPGRADE_AVAILABLE 720-minute TTL", () => {
  const entry = {
    kind: "UPGRADE_AVAILABLE",
    local: "0.5.0",
    remote: "0.5.1",
    timestamp: 0,
  };
  assert(cacheFresh(entry, 11 * 3600 * 1000), "11h: fresh");
  assert(!cacheFresh(entry, 12 * 3600 * 1000), "12h: stale");
});

// ── Snooze ──

test("writeSnooze + readSnooze round-trip", () => {
  freshStateDir();
  writeSnooze({ version: "0.5.1", level: 1, timestamp: 5000 });
  const s = readSnooze();
  assertEq(s.version, "0.5.1", "version");
  assertEq(s.level, 1, "level");
  assertEq(s.timestamp, 5000, "timestamp");
});

test("bumpSnooze starts at 1 and caps at 3", () => {
  freshStateDir();
  let s = bumpSnooze("0.5.1", 1000);
  assertEq(s.level, 1, "first bump L1");
  s = bumpSnooze("0.5.1", 2000);
  assertEq(s.level, 2, "second bump L2");
  s = bumpSnooze("0.5.1", 3000);
  assertEq(s.level, 3, "third bump L3");
  s = bumpSnooze("0.5.1", 4000);
  assertEq(s.level, 3, "capped at L3");
});

test("bumpSnooze resets level when version changes", () => {
  freshStateDir();
  bumpSnooze("0.5.1", 1000);
  bumpSnooze("0.5.1", 2000);
  const s = bumpSnooze("0.5.2", 3000);
  assertEq(s.level, 1, "new version resets");
  assertEq(s.version, "0.5.2", "new version recorded");
});

test("setSnooze clamps levels to [1,3]", () => {
  freshStateDir();
  assertEq(setSnooze("0.5.1", 0).level, 1, "0 clamps to 1");
  assertEq(setSnooze("0.5.1", 5).level, 3, "5 clamps to 3");
  assertEq(setSnooze("0.5.1", "garbage").level, 1, "NaN defaults to 1");
});

test("snoozeActive respects level TTL", () => {
  freshStateDir();
  writeSnooze({ version: "0.5.1", level: 1, timestamp: 0 });
  assert(snoozeActive("0.5.1", 23 * 3600 * 1000), "L1 23h: active");
  assert(!snoozeActive("0.5.1", 25 * 3600 * 1000), "L1 25h: expired");
});

test("snoozeActive false when version differs", () => {
  freshStateDir();
  writeSnooze({ version: "0.5.1", level: 1, timestamp: 0 });
  assert(!snoozeActive("0.5.2", 1000), "version mismatch");
});

test("clearSnooze removes the file", () => {
  freshStateDir();
  writeSnooze({ version: "0.5.1", level: 1, timestamp: 0 });
  assert(clearSnooze(), "clear succeeded");
  assertEq(readSnooze(), null, "file gone");
});

// ── just-upgraded-from ──

test("readAndClearJustUpgraded consumes the file exactly once", () => {
  freshStateDir();
  writeJustUpgraded("0.4.8");
  assertEq(readAndClearJustUpgraded(), "0.4.8", "first read");
  assertEq(readAndClearJustUpgraded(), null, "second read finds nothing");
});

test("readAndClearJustUpgraded rejects invalid version", () => {
  const dir = freshStateDir();
  fs.writeFileSync(path.join(dir, "just-upgraded-from"), "not-a-version\n");
  assertEq(readAndClearJustUpgraded(), null, "bad content returns null");
});

// ── Stubbed remote server ──

let SERVER, SERVER_URL;

function startServer(handler) {
  return new Promise((resolve) => {
    SERVER = http.createServer(handler);
    SERVER.listen(0, "127.0.0.1", () => {
      const { port } = SERVER.address();
      SERVER_URL = `http://127.0.0.1:${port}/pkg.json`;
      process.env.YP_REMOTE_VERSION_URL = SERVER_URL;
      resolve();
    });
  });
}

function stopServer() {
  return new Promise((resolve) => {
    if (!SERVER) return resolve();
    SERVER.close(() => resolve());
  });
}

test("fetchRemoteVersion returns version on 200", async () => {
  await startServer((req, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ version: "0.5.1" }));
  });
  try {
    const v = await fetchRemoteVersion();
    assertEq(v, "0.5.1", "version returned");
  } finally {
    await stopServer();
  }
});

test("fetchRemoteVersion returns null on non-200", async () => {
  await startServer((req, res) => {
    res.writeHead(500);
    res.end("err");
  });
  try {
    const v = await fetchRemoteVersion();
    assertEq(v, null, "null on 500");
  } finally {
    await stopServer();
  }
});

test("fetchRemoteVersion returns null on invalid JSON", async () => {
  await startServer((req, res) => {
    res.writeHead(200);
    res.end("<html>oops</html>");
  });
  try {
    const v = await fetchRemoteVersion();
    assertEq(v, null, "null on bad body");
  } finally {
    await stopServer();
  }
});

test("fetchRemoteVersion returns null on non-semver version", async () => {
  await startServer((req, res) => {
    res.writeHead(200);
    res.end(JSON.stringify({ version: "v1.2" }));
  });
  try {
    const v = await fetchRemoteVersion();
    assertEq(v, null, "null on bad version");
  } finally {
    await stopServer();
  }
});

// ── refreshIfStale ──

test("refreshIfStale writes UPGRADE_AVAILABLE when remote > local", async () => {
  freshStateDir();
  await startServer((req, res) => {
    res.writeHead(200);
    res.end(JSON.stringify({ version: "0.5.1" }));
  });
  try {
    const entry = await refreshIfStale("0.5.0", 1000);
    assertEq(entry.kind, "UPGRADE_AVAILABLE", "kind");
    assertEq(entry.remote, "0.5.1", "remote");
    const persisted = readCache();
    assertEq(persisted.kind, "UPGRADE_AVAILABLE", "cache persisted");
  } finally {
    await stopServer();
  }
});

test("refreshIfStale writes UP_TO_DATE when remote == local", async () => {
  freshStateDir();
  await startServer((req, res) => {
    res.writeHead(200);
    res.end(JSON.stringify({ version: "0.5.0" }));
  });
  try {
    const entry = await refreshIfStale("0.5.0", 1000);
    assertEq(entry.kind, "UP_TO_DATE", "kind");
  } finally {
    await stopServer();
  }
});

test("refreshIfStale uses cache when fresh", async () => {
  freshStateDir();
  writeCache({ kind: "UP_TO_DATE", local: "0.5.0", timestamp: 1000 });
  let fetched = false;
  await startServer((req, res) => {
    fetched = true;
    res.writeHead(200);
    res.end(JSON.stringify({ version: "0.5.0" }));
  });
  try {
    await refreshIfStale("0.5.0", 1000 + 10 * 60 * 1000); // well under 60 min TTL
    assert(!fetched, "no network hit when cache fresh");
  } finally {
    await stopServer();
  }
});

test("refreshIfStale clears mismatched-version snooze", async () => {
  freshStateDir();
  writeSnooze({ version: "0.5.0", level: 2, timestamp: 0 });
  await startServer((req, res) => {
    res.writeHead(200);
    res.end(JSON.stringify({ version: "0.5.2" }));
  });
  try {
    await refreshIfStale("0.5.1", 1000);
    assertEq(readSnooze(), null, "stale snooze cleared");
  } finally {
    await stopServer();
  }
});

// ── check() composition ──

test("check() returns JUST_UPGRADED marker and clears file", async () => {
  freshStateDir();
  writeJustUpgraded("0.4.8");
  const out = await check({ localVersion: "0.5.0" });
  assert(out.includes("YP_JUST_UPGRADED"), "marker present");
  assert(out.includes("0.4.8"), "prev version");
  assert(out.includes("0.5.0"), "new version");
  // Marker is one-shot.
  const again = await check({ localVersion: "0.5.0", enabled: false });
  assertEq(again, null, "no marker on second call");
});

test("check() returns UPGRADE_AVAILABLE line when cache says so", async () => {
  freshStateDir();
  const now = Date.now();
  writeCache({
    kind: "UPGRADE_AVAILABLE",
    local: "0.5.0",
    remote: "0.5.1",
    timestamp: now,
  });
  const out = await check({ localVersion: "0.5.0", now });
  assert(out && out.includes("YP_UPGRADE_AVAILABLE"), "marker present");
  assert(out.includes("0.5.0 0.5.1"), "both versions listed");
});

test("check() suppresses marker when snoozed", async () => {
  freshStateDir();
  const now = Date.now();
  writeCache({
    kind: "UPGRADE_AVAILABLE",
    local: "0.5.0",
    remote: "0.5.1",
    timestamp: now,
  });
  writeSnooze({ version: "0.5.1", level: 1, timestamp: now });
  const out = await check({ localVersion: "0.5.0", now });
  assertEq(out, null, "snoozed: no marker");
});

test("check() returns null when disabled", async () => {
  freshStateDir();
  writeCache({
    kind: "UPGRADE_AVAILABLE",
    local: "0.5.0",
    remote: "0.5.1",
    timestamp: Date.now(),
  });
  const out = await check({ localVersion: "0.5.0", enabled: false });
  assertEq(out, null, "disabled: no marker");
});

// ── Snooze CLI ──

test("runSnoozeCli reset clears snooze", () => {
  freshStateDir();
  writeSnooze({ version: "0.5.1", level: 2, timestamp: 1000 });
  const code = runSnoozeCli(["reset"]);
  assertEq(code, 0, "exit 0");
  assertEq(readSnooze(), null, "cleared");
});

test("runSnoozeCli bumps when upgrade pending", () => {
  freshStateDir();
  writeCache({
    kind: "UPGRADE_AVAILABLE",
    local: "0.5.0",
    remote: "0.5.1",
    timestamp: Date.now(),
  });
  const code = runSnoozeCli([]);
  assertEq(code, 0, "exit 0");
  const s = readSnooze();
  assertEq(s.version, "0.5.1", "snooze targets remote");
  assertEq(s.level, 1, "first bump L1");
});

test("runSnoozeCli with explicit level", () => {
  freshStateDir();
  writeCache({
    kind: "UPGRADE_AVAILABLE",
    local: "0.5.0",
    remote: "0.5.1",
    timestamp: Date.now(),
  });
  const code = runSnoozeCli(["2"]);
  assertEq(code, 0, "exit 0");
  assertEq(readSnooze().level, 2, "level 2");
});

test("runSnoozeCli handles 'no upgrade pending' gracefully", () => {
  freshStateDir();
  const code = runSnoozeCli([]);
  assertEq(code, 0, "exit 0");
  assertEq(readSnooze(), null, "no snooze written");
});

// ── Run ──

(async () => {
  for (const { name, fn } of TESTS) {
    try {
      await fn();
      passed++;
      process.stdout.write(`  \u2713 ${name}\n`);
    } catch (err) {
      failed++;
      process.stdout.write(`  \u2717 ${name}\n    ${err.message}\n`);
    }
  }
  await stopServer();
  cleanup();
  process.stdout.write(`\n  ${passed} passed \u00b7 ${failed} failed\n`);
  process.exit(failed === 0 ? 0 : 1);
})();

void PKG;
