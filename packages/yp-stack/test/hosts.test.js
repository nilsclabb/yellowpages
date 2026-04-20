#!/usr/bin/env node
/**
 * Host registry tests (Phase 4).
 *
 * Verifies:
 *   - Every host in src/hosts/*.js is registered in src/hosts/index.js
 *   - validateAllHostConfigs() accepts the shipped registry
 *   - HOST_NAMES is unique
 *   - Back-compat shim (src/platforms.js) still exposes PLATFORMS /
 *     detectPlatforms / getPlatform with the same shape as before Phase 4
 *   - detectHosts() picks up a fixture .claude/ dir
 *   - hasCommandsSupport/commandsSubdir invariant holds for every host
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG = path.resolve(__dirname, "..");

const { ALL_HOSTS, HOST_MAP, HOST_NAMES, getHost, detectHosts } = await import(
  path.join(PKG, "src", "hosts", "index.js")
);
const { validateAllHostConfigs, validateHostConfig } = await import(
  path.join(PKG, "src", "hosts", "_host-config.js")
);
const { PLATFORMS, detectPlatforms, getPlatform } = await import(
  path.join(PKG, "src", "platforms.js")
);

const TESTS = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  TESTS.push({ name, fn });
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// ─── Registry integrity ──────────────────────────────────────────────────────

test("Every hosts/*.js file (except _host-config.js, index.js) is registered", () => {
  const hostsDir = path.join(PKG, "src", "hosts");
  const files = fs
    .readdirSync(hostsDir)
    .filter((f) => f.endsWith(".js") && !f.startsWith("_") && f !== "index.js");
  const fileNames = files.map((f) => f.replace(/\.js$/, "")).sort();
  const registered = HOST_NAMES.slice().sort();
  assert(
    JSON.stringify(fileNames) === JSON.stringify(registered),
    `hosts/*.js files: ${fileNames.join(",")} ≠ registered: ${registered.join(",")}`,
  );
});

test("validateAllHostConfigs accepts shipped registry", () => {
  const errors = validateAllHostConfigs(ALL_HOSTS);
  assert(errors.length === 0, `validation errors: ${errors.join("; ")}`);
});

test("HOST_NAMES has no duplicates", () => {
  const seen = new Set();
  for (const n of HOST_NAMES) {
    assert(!seen.has(n), `duplicate name: ${n}`);
    seen.add(n);
  }
});

test("HOST_MAP is consistent with ALL_HOSTS", () => {
  assert(Object.keys(HOST_MAP).length === ALL_HOSTS.length, "HOST_MAP size mismatch");
  for (const h of ALL_HOSTS) {
    assert(HOST_MAP[h.name] === h, `HOST_MAP[${h.name}] ≠ registered config`);
  }
});

// ─── Per-host invariants ─────────────────────────────────────────────────────

test("Every host passes validateHostConfig individually", () => {
  for (const h of ALL_HOSTS) {
    const errors = validateHostConfig(h);
    assert(errors.length === 0, `[${h.name}] ${errors.join("; ")}`);
  }
});

test("commandsSubdir ↔ hasCommandsSupport invariant", () => {
  for (const h of ALL_HOSTS) {
    if (h.hasCommandsSupport) {
      assert(
        typeof h.commandsSubdir === "string" && h.commandsSubdir.length > 0,
        `[${h.name}] hasCommandsSupport=true but commandsSubdir is missing`,
      );
    } else {
      assert(
        h.commandsSubdir === null,
        `[${h.name}] hasCommandsSupport=false but commandsSubdir is set`,
      );
    }
  }
});

test("Only Claude Code has commands + integration today", () => {
  const withCommands = ALL_HOSTS.filter((h) => h.hasCommandsSupport).map((h) => h.name);
  const withIntegration = ALL_HOSTS.filter((h) => h.hasIntegration).map((h) => h.name);
  assert(
    JSON.stringify(withCommands) === JSON.stringify(["claude"]),
    `Unexpected commands hosts: ${withCommands.join(",")}`,
  );
  assert(
    JSON.stringify(withIntegration) === JSON.stringify(["claude"]),
    `Unexpected integration hosts: ${withIntegration.join(",")}`,
  );
});

test("getHost returns registered config; unknown returns undefined", () => {
  assert(getHost("claude")?.displayName === "Claude Code", "getHost('claude') failed");
  assert(getHost("does-not-exist") === undefined, "getHost(unknown) should be undefined");
});

// ─── Detection ───────────────────────────────────────────────────────────────

test("detectHosts picks up a project-level .claude/ fixture", () => {
  const tmp = path.join(os.tmpdir(), "yp-hosts-test-" + Date.now());
  fs.mkdirSync(path.join(tmp, ".claude"), { recursive: true });
  try {
    const detected = detectHosts(tmp);
    assert(detected.includes("claude"), `Expected 'claude', got: ${detected.join(",")}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test("detectHosts finds generic via project .agents/", () => {
  const tmp = path.join(os.tmpdir(), "yp-hosts-generic-" + Date.now());
  fs.mkdirSync(path.join(tmp, ".agents"), { recursive: true });
  try {
    const detected = detectHosts(tmp);
    assert(detected.includes("generic"), `Expected 'generic', got: ${detected.join(",")}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

// ─── Back-compat shim ────────────────────────────────────────────────────────

test("platforms.js PLATFORMS mirrors ALL_HOSTS order and length", () => {
  assert(
    PLATFORMS.length === ALL_HOSTS.length,
    `PLATFORMS(${PLATFORMS.length}) ≠ ALL_HOSTS(${ALL_HOSTS.length})`,
  );
  for (let i = 0; i < ALL_HOSTS.length; i++) {
    assert(
      PLATFORMS[i].value === ALL_HOSTS[i].name,
      `PLATFORMS[${i}].value=${PLATFORMS[i].value} ≠ host.name=${ALL_HOSTS[i].name}`,
    );
    assert(
      PLATFORMS[i].name === ALL_HOSTS[i].displayName,
      `PLATFORMS[${i}].name=${PLATFORMS[i].name} ≠ host.displayName=${ALL_HOSTS[i].displayName}`,
    );
  }
});

test("platforms.js getPlatform returns legacy shape for 'claude'", () => {
  const p = getPlatform("claude");
  assert(p, "getPlatform('claude') is undefined");
  assert(p.value === "claude", `value=${p.value}`);
  assert(p.name === "Claude Code", `name=${p.name}`);
  assert(p.skillPath === ".claude/skills", `skillPath=${p.skillPath}`);
  assert(p.hasCommandsSupport === true, "hasCommandsSupport should be true");
  assert(p.commandsSubdir === ".claude/commands", `commandsSubdir=${p.commandsSubdir}`);
});

test("platforms.js getPlatform('unknown') is undefined", () => {
  assert(getPlatform("does-not-exist") === undefined, "should be undefined");
});

test("platforms.js detectPlatforms delegates to detectHosts", () => {
  const tmp = path.join(os.tmpdir(), "yp-platforms-compat-" + Date.now());
  fs.mkdirSync(path.join(tmp, ".cursor"), { recursive: true });
  try {
    const detected = detectPlatforms(tmp);
    assert(detected.includes("cursor"), `Expected 'cursor', got: ${detected.join(",")}`);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

// ─── Validator fault paths ───────────────────────────────────────────────────

test("validateHostConfig flags invalid name", () => {
  const bad = { ...ALL_HOSTS[0], name: "Bad Name!" };
  const errors = validateHostConfig(bad);
  assert(
    errors.some((e) => e.includes("name")),
    `Expected name error, got: ${errors.join("; ")}`,
  );
});

test("validateHostConfig flags hasCommandsSupport without subdir", () => {
  const bad = {
    ...ALL_HOSTS[0],
    hasCommandsSupport: true,
    commandsSubdir: null,
  };
  const errors = validateHostConfig(bad);
  assert(
    errors.some((e) => e.includes("commandsSubdir required")),
    `Expected commandsSubdir error, got: ${errors.join("; ")}`,
  );
});

test("validateAllHostConfigs flags duplicate names", () => {
  const dup = [...ALL_HOSTS, { ...ALL_HOSTS[0] }];
  const errors = validateAllHostConfigs(dup);
  assert(
    errors.some((e) => e.includes("duplicate host name")),
    `Expected duplicate-name error, got: ${errors.join("; ")}`,
  );
});

// ─── Run ─────────────────────────────────────────────────────────────────────

console.log("\n🧪 yp-stack hosts tests\n");

for (const t of TESTS) {
  try {
    t.fn();
    passed++;
    console.log(`  ✅ ${t.name}`);
  } catch (err) {
    failed++;
    console.log(`  ❌ ${t.name}`);
    console.log(`     ${err.message}`);
  }
}

console.log(`\n  ${passed} passed, ${failed} failed, ${TESTS.length} total\n`);

process.exit(failed > 0 ? 1 : 0);
