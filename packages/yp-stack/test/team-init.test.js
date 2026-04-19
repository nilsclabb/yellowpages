#!/usr/bin/env node
/**
 * team-init module tests for yp-stack.
 *
 * Covers: CLAUDE.md append/replace/dedup, .gitignore dedup, settings.json
 * PreToolUse hook registration (new + patch + dedup), check-yp.sh write
 * + chmod, vendored-install migration, git-repo precondition.
 *
 * Run: node test/team-init.test.js   (from packages/yp-stack/)
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import {
  runTeamInit,
  updateClaudeMd,
  updateGitignore,
  patchSettingsJson,
  writeCheckHook,
  migrateVendoredInstall,
  isValidMode,
  modes,
} from "../src/team-init.js";

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

// ── Per-test tmp repo ──

const BASE_TMP = path.join(os.tmpdir(), "yp-team-init-test-" + Date.now());
let testCounter = 0;

function makeRepo({ git = true } = {}) {
  testCounter++;
  const dir = path.join(BASE_TMP, `t${testCounter}`);
  fs.mkdirSync(dir, { recursive: true });
  if (git) {
    execSync("git init -q", { cwd: dir });
    // Ensure commits are possible inside test repos regardless of host config.
    execSync("git config user.email test@example.com", { cwd: dir });
    execSync("git config user.name Test", { cwd: dir });
  }
  return dir;
}

function cleanup() {
  try {
    fs.rmSync(BASE_TMP, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

// ── Mode validation ──

test("isValidMode accepts optional and required only", () => {
  assert(isValidMode("optional"), "optional should be valid");
  assert(isValidMode("required"), "required should be valid");
  assert(!isValidMode("strict"), "strict should not be valid");
  assert(!isValidMode(""), "empty should not be valid");
  assertEq(modes().length, 2, "modes() returns two entries");
});

// ── CLAUDE.md ──

test("updateClaudeMd creates file when absent", () => {
  const dir = makeRepo();
  const r = updateClaudeMd(dir, "optional");
  assertEq(r.status, "created", "status");
  const body = fs.readFileSync(path.join(dir, "CLAUDE.md"), "utf-8");
  assert(body.includes("<!-- yellowpages:start -->"), "has start marker");
  assert(body.includes("<!-- yellowpages:end -->"), "has end marker");
  assert(body.includes("yellowpages (recommended)"), "optional heading present");
});

test("updateClaudeMd appends to existing CLAUDE.md preserving prior content", () => {
  const dir = makeRepo();
  const prior = "# My Project\n\nSome notes.\n";
  fs.writeFileSync(path.join(dir, "CLAUDE.md"), prior, "utf-8");
  const r = updateClaudeMd(dir, "required");
  assertEq(r.status, "updated", "status");
  const body = fs.readFileSync(path.join(dir, "CLAUDE.md"), "utf-8");
  assert(body.startsWith("# My Project"), "prior content preserved at top");
  assert(body.includes("yellowpages (required)"), "required heading present");
});

test("updateClaudeMd replaces existing yp block (dedup on re-run)", () => {
  const dir = makeRepo();
  updateClaudeMd(dir, "optional");
  const r = updateClaudeMd(dir, "required");
  assertEq(r.status, "updated", "status updated on mode swap");
  const body = fs.readFileSync(path.join(dir, "CLAUDE.md"), "utf-8");
  const startCount = (body.match(/<!-- yellowpages:start -->/g) || []).length;
  const endCount = (body.match(/<!-- yellowpages:end -->/g) || []).length;
  assertEq(startCount, 1, "exactly one start marker");
  assertEq(endCount, 1, "exactly one end marker");
  assert(body.includes("yellowpages (required)"), "new mode content present");
  assert(!body.includes("yellowpages (recommended)"), "old mode content removed");
});

test("updateClaudeMd is idempotent when re-run with same mode", () => {
  const dir = makeRepo();
  updateClaudeMd(dir, "optional");
  const first = fs.readFileSync(path.join(dir, "CLAUDE.md"), "utf-8");
  const r = updateClaudeMd(dir, "optional");
  assertEq(r.status, "unchanged", "second run unchanged");
  const second = fs.readFileSync(path.join(dir, "CLAUDE.md"), "utf-8");
  assertEq(first, second, "file content byte-identical");
});

test("updateClaudeMd preserves content after the yp block", () => {
  const dir = makeRepo();
  const prior =
    "# Top\n\n" +
    "<!-- yellowpages:start -->\nOLD BLOCK\n<!-- yellowpages:end -->\n\n" +
    "## Tail\n\nTail content.\n";
  fs.writeFileSync(path.join(dir, "CLAUDE.md"), prior, "utf-8");
  updateClaudeMd(dir, "optional");
  const body = fs.readFileSync(path.join(dir, "CLAUDE.md"), "utf-8");
  assert(body.includes("# Top"), "top preserved");
  assert(body.includes("## Tail"), "tail preserved");
  assert(!body.includes("OLD BLOCK"), "old block replaced");
});

// ── .gitignore ──

test("updateGitignore creates file when absent", () => {
  const dir = makeRepo();
  const r = updateGitignore(dir);
  assertEq(r.status, "created", "status");
  const body = fs.readFileSync(path.join(dir, ".gitignore"), "utf-8");
  assert(body.includes(".claude/skills/yellowpages/"), "entry present");
});

test("updateGitignore appends entry when file exists without it", () => {
  const dir = makeRepo();
  fs.writeFileSync(path.join(dir, ".gitignore"), "node_modules/\n", "utf-8");
  const r = updateGitignore(dir);
  assertEq(r.status, "updated", "status");
  const body = fs.readFileSync(path.join(dir, ".gitignore"), "utf-8");
  assert(body.includes("node_modules/"), "prior entry kept");
  assert(body.includes(".claude/skills/yellowpages/"), "new entry added");
});

test("updateGitignore is idempotent", () => {
  const dir = makeRepo();
  updateGitignore(dir);
  const r = updateGitignore(dir);
  assertEq(r.status, "unchanged", "second run unchanged");
  const body = fs.readFileSync(path.join(dir, ".gitignore"), "utf-8");
  const matches = body.match(/\.claude\/skills\/yellowpages\//g) || [];
  assertEq(matches.length, 1, "exactly one entry");
});

test("updateGitignore dedups when entry lacks trailing slash", () => {
  const dir = makeRepo();
  fs.writeFileSync(path.join(dir, ".gitignore"), ".claude/skills/yellowpages\n", "utf-8");
  const r = updateGitignore(dir);
  assertEq(r.status, "unchanged", "recognises no-slash variant");
});

// ── check-yp.sh hook ──

test("writeCheckHook writes script + sets exec bit", () => {
  const dir = makeRepo();
  const r = writeCheckHook(dir);
  assertEq(r.status, "created", "status");
  const target = path.join(dir, ".claude", "hooks", "check-yp.sh");
  const body = fs.readFileSync(target, "utf-8");
  assert(body.startsWith("#!/usr/bin/env bash"), "shebang present");
  assert(body.includes("permissionDecision"), "hook payload present");
  const mode = fs.statSync(target).mode & 0o777;
  assert((mode & 0o100) !== 0, `owner exec bit set (mode=${mode.toString(8)})`);
});

test("writeCheckHook reports unchanged when content identical", () => {
  const dir = makeRepo();
  writeCheckHook(dir);
  const r = writeCheckHook(dir);
  assertEq(r.status, "unchanged", "status");
});

// ── settings.json patch ──

test("patchSettingsJson creates settings.json with PreToolUse entry when absent", () => {
  const dir = makeRepo();
  const r = patchSettingsJson(dir);
  assertEq(r.status, "created", "status");
  const body = JSON.parse(fs.readFileSync(path.join(dir, ".claude", "settings.json"), "utf-8"));
  assert(Array.isArray(body.hooks.PreToolUse), "PreToolUse is an array");
  assertEq(body.hooks.PreToolUse.length, 1, "one entry");
  assertEq(body.hooks.PreToolUse[0].matcher, "Skill", "matcher Skill");
  assert(body.hooks.PreToolUse[0].hooks[0].command.includes("check-yp.sh"), "command refs hook");
});

test("patchSettingsJson preserves unrelated user hooks", () => {
  const dir = makeRepo();
  fs.mkdirSync(path.join(dir, ".claude"), { recursive: true });
  const prior = {
    hooks: {
      PreToolUse: [
        {
          matcher: "Bash",
          hooks: [{ type: "command", command: "echo hi" }],
        },
      ],
      PostToolUse: [{ matcher: "*", hooks: [{ type: "command", command: "echo bye" }] }],
    },
    model: "sonnet",
  };
  fs.writeFileSync(path.join(dir, ".claude", "settings.json"), JSON.stringify(prior, null, 2));

  const r = patchSettingsJson(dir);
  assertEq(r.status, "updated", "status");
  const body = JSON.parse(fs.readFileSync(path.join(dir, ".claude", "settings.json"), "utf-8"));
  assertEq(body.hooks.PreToolUse.length, 2, "kept user hook + added our hook");
  assertEq(body.hooks.PreToolUse[0].matcher, "Bash", "user hook preserved");
  assertEq(body.hooks.PreToolUse[1].matcher, "Skill", "our hook appended");
  assertEq(body.hooks.PostToolUse.length, 1, "PostToolUse untouched");
  assertEq(body.model, "sonnet", "unrelated keys preserved");
});

test("patchSettingsJson dedups on re-run (no duplicate Skill entries)", () => {
  const dir = makeRepo();
  patchSettingsJson(dir);
  patchSettingsJson(dir);
  const body = JSON.parse(fs.readFileSync(path.join(dir, ".claude", "settings.json"), "utf-8"));
  const skillEntries = body.hooks.PreToolUse.filter((e) => e.matcher === "Skill");
  assertEq(skillEntries.length, 1, "exactly one Skill entry after two runs");
});

test("patchSettingsJson throws on invalid JSON", () => {
  const dir = makeRepo();
  fs.mkdirSync(path.join(dir, ".claude"), { recursive: true });
  fs.writeFileSync(path.join(dir, ".claude", "settings.json"), "{ not json", "utf-8");
  let threw = false;
  try {
    patchSettingsJson(dir);
  } catch (err) {
    threw = /not valid JSON/.test(err.message);
  }
  assert(threw, "expected parse error");
});

test("patchSettingsJson reports unchanged when already patched", () => {
  const dir = makeRepo();
  patchSettingsJson(dir);
  const r = patchSettingsJson(dir);
  assertEq(r.status, "unchanged", "idempotent run");
});

// ── Vendored-install migration ──

test("migrateVendoredInstall is a no-op when directory absent", () => {
  const dir = makeRepo();
  const r = migrateVendoredInstall(dir);
  assertEq(r.migrated, false, "no migration");
});

test("migrateVendoredInstall is a no-op when target is a symlink", () => {
  const dir = makeRepo();
  const skillsDir = path.join(dir, ".claude", "skills");
  fs.mkdirSync(skillsDir, { recursive: true });
  // Symlink to some other path (target need not exist for lstat to identify).
  fs.symlinkSync(
    path.join(os.homedir(), ".claude", "skills", "yellowpages"),
    path.join(skillsDir, "yellowpages"),
  );
  const r = migrateVendoredInstall(dir);
  assertEq(r.migrated, false, "symlink left alone");
  assert(fs.existsSync(path.join(skillsDir, "yellowpages")), "symlink still exists");
});

test("migrateVendoredInstall removes real directory + git-index entry", () => {
  const dir = makeRepo();
  const vendored = path.join(dir, ".claude", "skills", "yellowpages");
  fs.mkdirSync(vendored, { recursive: true });
  fs.writeFileSync(path.join(vendored, "SKILL.md"), "stub\n", "utf-8");
  execSync("git add .claude", { cwd: dir });
  execSync("git commit -q -m initial", { cwd: dir });

  const r = migrateVendoredInstall(dir);
  assertEq(r.migrated, true, "migration ran");
  assert(!fs.existsSync(vendored), "directory removed from working tree");
  // The git index should no longer track the vendored tree.
  const lsFiles = execSync("git ls-files", { cwd: dir }).toString();
  assert(!lsFiles.includes(".claude/skills/yellowpages"), "git index purged");
});

// ── runTeamInit orchestrator ──

test("runTeamInit optional mode writes CLAUDE.md + gitignore only", () => {
  const dir = makeRepo();
  const r = runTeamInit({ mode: "optional", cwd: dir });
  assertEq(r.mode, "optional", "mode round-trips");
  const kinds = r.steps.map((s) => s.kind).sort();
  // No check-hook / settings-json in optional mode.
  assert(kinds.includes("claude-md"), "claude-md step");
  assert(kinds.includes("gitignore"), "gitignore step");
  assert(!kinds.includes("check-hook"), "no check-hook in optional");
  assert(!kinds.includes("settings-json"), "no settings-json in optional");
  assert(!fs.existsSync(path.join(dir, ".claude", "hooks", "check-yp.sh")), "hook not written");
});

test("runTeamInit required mode writes full enforcement kit", () => {
  const dir = makeRepo();
  const r = runTeamInit({ mode: "required", cwd: dir });
  const kinds = r.steps.map((s) => s.kind).sort();
  assert(kinds.includes("check-hook"), "check-hook step");
  assert(kinds.includes("settings-json"), "settings-json step");
  assert(fs.existsSync(path.join(dir, ".claude", "hooks", "check-yp.sh")), "hook file present");
  assert(fs.existsSync(path.join(dir, ".claude", "settings.json")), "settings.json present");
});

test("runTeamInit throws outside a git repo", () => {
  const dir = makeRepo({ git: false });
  let threw = false;
  try {
    runTeamInit({ mode: "optional", cwd: dir });
  } catch (err) {
    threw = /git repository/.test(err.message);
  }
  assert(threw, "expected git-repo error");
});

test("runTeamInit is idempotent when re-run in same mode", () => {
  const dir = makeRepo();
  runTeamInit({ mode: "required", cwd: dir });
  const settingsBefore = fs.readFileSync(path.join(dir, ".claude", "settings.json"), "utf-8");
  const gitignoreBefore = fs.readFileSync(path.join(dir, ".gitignore"), "utf-8");
  const claudeBefore = fs.readFileSync(path.join(dir, "CLAUDE.md"), "utf-8");
  runTeamInit({ mode: "required", cwd: dir });
  assertEq(
    fs.readFileSync(path.join(dir, ".claude", "settings.json"), "utf-8"),
    settingsBefore,
    "settings.json byte-identical after second run",
  );
  assertEq(
    fs.readFileSync(path.join(dir, ".gitignore"), "utf-8"),
    gitignoreBefore,
    ".gitignore byte-identical",
  );
  assertEq(
    fs.readFileSync(path.join(dir, "CLAUDE.md"), "utf-8"),
    claudeBefore,
    "CLAUDE.md byte-identical",
  );
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
  cleanup();
  process.stdout.write(`\n  ${passed} passed \u00b7 ${failed} failed\n`);
  process.exit(failed === 0 ? 0 : 1);
})();

// Silence unused PKG import warning for linters that flag it; PKG is
// reserved for future tests that read files from the package.
void PKG;
