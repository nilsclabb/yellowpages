#!/usr/bin/env node
/**
 * Config module tests for yp-stack.
 *
 * Covers: get/set/unset, defaults fallback, closed-domain validation,
 * header write on first set, in-place update, round-trip with extra
 * keys, and resolveConfig/persistInstallChoices behavior.
 *
 * Run: node test/config.test.js   (from packages/yp-stack/)
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
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

// ── Per-test tmp state dir ──
//
// Each test gets a fresh YP_STATE_DIR. We set the env var AFTER importing
// config.js once, but config.js reads the env on every call (stateDir() is
// a function), so this works correctly.

const BASE_TMP = path.join(os.tmpdir(), "yp-config-test-" + Date.now());

function freshStateDir(name) {
  const dir = path.join(BASE_TMP, name);
  fs.mkdirSync(dir, { recursive: true });
  process.env.YP_STATE_DIR = dir;
  return dir;
}

// ── Import target ──

const {
  DEFAULTS,
  configPath,
  getConfig,
  setConfig,
  unsetConfig,
  listConfig,
  resolveConfig,
  persistInstallChoices,
  readRawConfig,
  isValidKey,
  runConfigCli,
} = await import(path.join(PKG, "src", "config.js"));

// ── Tests ──

test("configPath honors YP_STATE_DIR env", () => {
  freshStateDir("path-env");
  assert(configPath().endsWith("config.yaml"), "configPath should end with config.yaml");
  assert(configPath().includes("path-env"), "configPath should honor YP_STATE_DIR");
});

test("getConfig returns default when file absent", () => {
  freshStateDir("get-default");
  assert(getConfig("scope") === DEFAULTS.scope, "scope should equal default");
  assert(getConfig("platform") === DEFAULTS.platform, "platform should equal default (empty)");
});

test("getConfig returns empty string for unknown key", () => {
  freshStateDir("get-unknown");
  assert(getConfig("no_such_key") === "", "unknown key should return empty string");
});

test("getConfig throws for invalid key shape", () => {
  freshStateDir("get-invalid");
  let threw = false;
  try {
    getConfig("bad-key");
  } catch {
    threw = true;
  }
  assert(threw, "should throw on hyphen in key");
});

test("setConfig writes header on first write", () => {
  freshStateDir("set-header");
  setConfig("scope", "skill");
  const content = fs.readFileSync(configPath(), "utf-8");
  assert(content.startsWith("# yellowpages configuration"), "should begin with header");
  assert(content.includes("scope: skill"), "should contain new kv");
});

test("setConfig updates existing key in place", () => {
  freshStateDir("set-update");
  setConfig("scope", "skill");
  setConfig("scope", "minimal");
  const raw = readRawConfig();
  assert(raw.scope === "minimal", `expected minimal, got ${raw.scope}`);
  const content = fs.readFileSync(configPath(), "utf-8");
  const occurrences = content.match(/^scope:/gm) || [];
  assert(occurrences.length === 1, `scope key should appear once, got ${occurrences.length}`);
});

test("setConfig appends new key without disturbing header", () => {
  freshStateDir("set-append");
  setConfig("scope", "full");
  setConfig("caveman", "ultra");
  const raw = readRawConfig();
  assert(raw.scope === "full");
  assert(raw.caveman === "ultra");
  const content = fs.readFileSync(configPath(), "utf-8");
  assert(content.startsWith("# yellowpages configuration"), "header preserved");
});

test("setConfig coerces closed-domain invalid value to default", () => {
  freshStateDir("set-coerce");
  const { written, warning } = setConfig("scope", "bogus");
  assert(written === DEFAULTS.scope, `expected coerce to ${DEFAULTS.scope}, got ${written}`);
  assert(warning && warning.includes("Valid values"), "warning should list valid values");
});

test("setConfig accepts closed-domain valid value without warning", () => {
  freshStateDir("set-valid");
  const { written, warning } = setConfig("caveman", "lite");
  assert(written === "lite");
  assert(!warning, "no warning for valid value");
});

test("setConfig rejects multi-line values", () => {
  freshStateDir("set-multiline");
  const { written } = setConfig("platform", "claude\nmalicious");
  assert(written === "claude", `multiline should be trimmed to first line, got ${written}`);
});

test("setConfig throws for invalid key", () => {
  freshStateDir("set-invalid-key");
  let threw = false;
  try {
    setConfig("bad key", "x");
  } catch {
    threw = true;
  }
  assert(threw, "should throw on space in key");
});

test("unsetConfig removes key from file", () => {
  freshStateDir("unset");
  setConfig("scope", "minimal");
  setConfig("caveman", "lite");
  const removed = unsetConfig("scope");
  assert(removed === true);
  const raw = readRawConfig();
  assert(!("scope" in raw), "scope should be removed from raw");
  assert(raw.caveman === "lite", "caveman should still be set");
});

test("unsetConfig returns false when key absent", () => {
  freshStateDir("unset-absent");
  const removed = unsetConfig("scope");
  assert(removed === false);
});

test("listConfig shows set vs default source", () => {
  freshStateDir("list");
  setConfig("scope", "minimal");
  const out = listConfig();
  assert(out.scope.value === "minimal");
  assert(out.scope.source === "set");
  assert(out.caveman.value === DEFAULTS.caveman);
  assert(out.caveman.source === "default");
});

test("resolveConfig.hasConfig true when file exists", () => {
  freshStateDir("resolve-has");
  setConfig("scope", "full");
  const resolved = resolveConfig();
  assert(resolved.hasConfig === true);
  assert(resolved.scope.value === "full");
  assert(resolved.scope.source === "set");
});

test("resolveConfig.hasConfig false when file absent", () => {
  freshStateDir("resolve-missing");
  const resolved = resolveConfig();
  assert(resolved.hasConfig === false);
  assert(resolved.scope.value === DEFAULTS.scope);
  assert(resolved.scope.source === "default");
});

test("persistInstallChoices writes only unset keys", () => {
  freshStateDir("persist");
  setConfig("scope", "minimal"); // already set
  const written = persistInstallChoices({
    scope: "full",
    platform: "claude",
    default_install_location: "project",
  });
  // scope should NOT be overwritten
  assert(!written.includes("scope"), "should not overwrite existing scope");
  assert(written.includes("platform"), "should write new platform key");
  assert(written.includes("default_install_location"), "should write install location");
  const raw = readRawConfig();
  assert(raw.scope === "minimal", "existing scope preserved");
  assert(raw.platform === "claude");
  assert(raw.default_install_location === "project");
});

test("isValidKey accepts snake_case and alphanum", () => {
  assert(isValidKey("abc"));
  assert(isValidKey("abc_def"));
  assert(isValidKey("ABC123"));
  assert(!isValidKey("abc-def"));
  assert(!isValidKey("abc.def"));
  assert(!isValidKey(""));
  assert(!isValidKey(null));
});

test("runConfigCli get prints value", () => {
  freshStateDir("cli-get");
  setConfig("scope", "skill");
  const { output, exit } = captureStdout(() => runConfigCli(["get", "scope"]));
  assert(exit === 0, `expected exit 0, got ${exit}`);
  assert(output.trim() === "skill", `expected 'skill', got '${output.trim()}'`);
});

test("runConfigCli set writes and prints", () => {
  freshStateDir("cli-set");
  const { exit } = captureStdout(() => runConfigCli(["set", "scope", "minimal"]));
  assert(exit === 0);
  assert(getConfig("scope") === "minimal");
});

test("runConfigCli invalid subcommand exits 1", () => {
  freshStateDir("cli-bad");
  const { exit } = captureStdout(() => runConfigCli(["bogus"]));
  assert(exit === 1);
});

test("runConfigCli defaults prints DEFAULTS table", () => {
  freshStateDir("cli-defaults");
  const { output, exit } = captureStdout(() => runConfigCli(["defaults"]));
  assert(exit === 0);
  for (const key of Object.keys(DEFAULTS)) {
    assert(output.includes(key), `defaults output should mention ${key}`);
  }
});

test("round-trip: set all DEFAULT keys then read back", () => {
  freshStateDir("round-trip");
  const sample = {
    platform: "claude",
    scope: "full",
    caveman: "full",
    state_tracking: "true",
    auto_upgrade: "false",
    update_check: "true",
    default_host: "auto",
    default_install_location: "global",
    team_mode: "optional",
  };
  for (const [k, v] of Object.entries(sample)) setConfig(k, v);
  const raw = readRawConfig();
  for (const [k, v] of Object.entries(sample)) {
    assert(raw[k] === v, `round-trip mismatch for ${k}: expected ${v}, got ${raw[k]}`);
  }
});

// ── Helpers ──

function captureStdout(fn) {
  const chunks = [];
  const origWrite = process.stdout.write.bind(process.stdout);
  const origErr = process.stderr.write.bind(process.stderr);
  process.stdout.write = (c) => {
    chunks.push(typeof c === "string" ? c : c.toString());
    return true;
  };
  process.stderr.write = () => true;
  let exit;
  try {
    exit = fn();
  } finally {
    process.stdout.write = origWrite;
    process.stderr.write = origErr;
  }
  return { output: chunks.join(""), exit };
}

// ── Run ──

(async () => {
  for (const t of TESTS) {
    try {
      await t.fn();
      passed++;
      console.log(`  ✓ ${t.name}`);
    } catch (err) {
      failed++;
      console.error(`  ✗ ${t.name}\n    ${err.message}`);
    }
  }
  // Cleanup
  try {
    fs.rmSync(BASE_TMP, { recursive: true, force: true });
  } catch {}
  console.log();
  console.log(`  ${passed} passed · ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
})();
