#!/usr/bin/env node
/**
 * Install test suite for yp-stack.
 *
 * Validates bundle integrity, platform detection, file installation
 * across all scope/projectType combinations, and skill list consistency.
 *
 * Run: node test/install.test.js   (from packages/yp-stack/)
 *   or: npm test                   (from packages/yp-stack/)
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG = path.resolve(__dirname, "..");

// Ensure bundle exists (generate if missing since content.js is gitignored)
const contentPath = path.join(PKG, "src", "content.js");
if (!fs.existsSync(contentPath)) {
  const { execSync } = await import("node:child_process");
  execSync("node scripts/bundle-content.js", { cwd: PKG, stdio: "inherit" });
}

const { FILES } = await import(path.join(PKG, "src", "content.js"));
const { installFiles, cleanPreviousInstall, createSkillSymlinks } = await import(
  path.join(PKG, "src", "install.js"),
);
const { detectPlatforms, getPlatform } = await import(
  path.join(PKG, "src", "platforms.js")
);

// ── Test harness ──

const TESTS = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
  TESTS.push({ name, fn });
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

const TMP = path.join(os.tmpdir(), "yp-test-" + Date.now());

// ── Bundle integrity ──

test("Bundle has skills/yellowpages/SKILL.md", () => {
  assert(FILES["skills/yellowpages/SKILL.md"], "Main SKILL.md missing");
});

test("Bundle has ≥14 reference files", () => {
  const refs = Object.keys(FILES).filter((k) =>
    k.startsWith("skills/yellowpages/references/"),
  );
  assert(refs.length >= 14, `Expected ≥14 refs, got ${refs.length}`);
});

test("Bundle has INDEX.md and SKILLS-INDEX.md", () => {
  assert(FILES["skills/yellowpages/INDEX.md"], "Missing INDEX.md");
  assert(FILES["skills/yellowpages/SKILLS-INDEX.md"], "Missing SKILLS-INDEX.md");
});

test("Bundle has all utility skills", () => {
  const expected = [
    "yp-help", "yp-status", "yp-context", "yp-session", "yp-reload",
    "yp-notes", "yp-remember", "yp-forget", "yp-compress", "yp-diagnose",
    "yp-tasks", "yp-upgrade", "auto-plan",
  ];
  for (const s of expected) {
    assert(FILES[`skills/yellowpages/${s}/SKILL.md`], `Missing: ${s}`);
  }
});

test("Bundle has all domain skills", () => {
  const expected = [
    "convex-patterns", "frontend-architecture", "monorepo-setup",
    "preferred-stack", "ui-component-system", "react-patterns", "caveman",
    "manage-global-skills", "manage-project-skills", "scaffold-skill",
    "validate-skill",
  ];
  for (const s of expected) {
    assert(FILES[`skills/yellowpages/${s}/SKILL.md`], `Missing: ${s}`);
  }
});

test("Bundle has governance files", () => {
  assert(FILES["ETHOS.md"], "Missing ETHOS.md");
  assert(FILES["project-context.md"], "Missing project-context.md");
  assert(
    FILES["workflows/create-skill/WORKFLOW.md"],
    "Missing workflow",
  );
});

test("Bundle has no .agents/skills/ duplicates", () => {
  const bad = Object.keys(FILES).filter((k) => k.includes(".agents"));
  assert(bad.length === 0, `Found .agents paths: ${bad.join(", ")}`);
});

// ── Skill list consistency ──

test("YP_SKILLS in manifest hook matches installed skill dirs", () => {
  // Extract skill dirs from bundle
  const skillDirs = new Set();
  for (const key of Object.keys(FILES)) {
    const m = key.match(/^skills\/yellowpages\/([^/]+)\/SKILL\.md$/);
    if (m) skillDirs.add(m[1]);
  }
  // Read manifest hook source and extract YP_SKILLS set
  const hookSrc = fs.readFileSync(
    path.resolve(PKG, "..", "..", "hooks", "skills-manifest.js"),
    "utf-8",
  );
  const setMatch = hookSrc.match(/new Set\(\[([\s\S]*?)\]\)/);
  assert(setMatch, "Could not parse YP_SKILLS from hook source");
  const hookSkills = new Set(
    setMatch[1].match(/'([^']+)'/g).map((s) => s.replace(/'/g, "")),
  );
  for (const dir of skillDirs) {
    assert(
      hookSkills.has(dir),
      `Skill dir "${dir}" exists in bundle but missing from YP_SKILLS in hook`,
    );
  }
});

// ── Platform detection ──

test("detectPlatforms finds Claude Code via home dir (skip in CI)", () => {
  if (process.env.CI) {
    // CI runner has no ~/.claude/ — skip gracefully
    return;
  }
  const detected = detectPlatforms("/tmp/nonexistent");
  assert(
    detected.includes("claude"),
    `Expected claude from home dir, got: ${detected}`,
  );
});

test("Claude Code platform has correct paths", () => {
  const p = getPlatform("claude");
  assert(p.globalSkillPath.endsWith(".claude/skills"), `Bad globalSkillPath: ${p.globalSkillPath}`);
  assert(p.skillPath === ".claude/skills", `Bad skillPath: ${p.skillPath}`);
});

// ── Install: skill scope ──

test("Skill scope installs all skills, no governance", () => {
  const dir = path.join(TMP, "skill");
  const s = path.join(dir, "skills");
  const g = path.join(dir, "gov");
  const result = installFiles({
    skillPathAbsolute: s,
    governancePath: g,
    scope: "skill",
    projectType: "new",
    stateTracking: false,
  });
  assert(fs.existsSync(path.join(s, "yellowpages", "SKILL.md")), "SKILL.md missing");
  assert(fs.existsSync(path.join(s, "yellowpages", "yp-help", "SKILL.md")), "yp-help missing");
  assert(fs.existsSync(path.join(s, "yellowpages", "references", "anatomy.md")), "refs missing");
  assert(!fs.existsSync(path.join(g, "ETHOS.md")), "Governance should not install");
  assert(result.created.length > 50, `Expected >50 files, got ${result.created.length}`);
});

// ── Install: full scope ──

test("Full scope installs skills + governance + learnings", () => {
  const dir = path.join(TMP, "full");
  const s = path.join(dir, "skills");
  const g = path.join(dir, "gov");
  const result = installFiles({
    skillPathAbsolute: s,
    governancePath: g,
    scope: "full",
    projectType: "new",
    stateTracking: true,
  });
  assert(fs.existsSync(path.join(s, "yellowpages", "SKILL.md")), "Skills missing");
  assert(fs.existsSync(path.join(g, "ETHOS.md")), "Governance missing");
  assert(fs.existsSync(path.join(g, "project-context.md")), "project-context missing");
  assert(fs.existsSync(path.join(g, "state", "learnings.jsonl")), "learnings.jsonl missing");
});

// ── Install: minimal scope ──

test("Minimal scope installs exactly 1 file", () => {
  const dir = path.join(TMP, "minimal");
  const s = path.join(dir, "skills");
  const g = path.join(dir, "gov");
  const result = installFiles({
    skillPathAbsolute: s,
    governancePath: g,
    scope: "minimal",
    projectType: "new",
    stateTracking: false,
  });
  assert(fs.existsSync(path.join(s, "yellowpages", "SKILL.md")), "SKILL.md missing");
  assert(result.created.length === 1, `Expected 1 file, got ${result.created.length}`);
});

// ── Install: non-destructive ──

test("Existing project mode preserves files", () => {
  const dir = path.join(TMP, "existing");
  const s = path.join(dir, "skills");
  const g = path.join(dir, "gov");
  installFiles({
    skillPathAbsolute: s,
    governancePath: g,
    scope: "skill",
    projectType: "new",
    stateTracking: false,
  });
  const fp = path.join(s, "yellowpages", "SKILL.md");
  fs.writeFileSync(fp, "CUSTOM");
  const result = installFiles({
    skillPathAbsolute: s,
    governancePath: g,
    scope: "skill",
    projectType: "existing",
    stateTracking: false,
  });
  assert(fs.readFileSync(fp, "utf-8") === "CUSTOM", "File was overwritten");
  assert(result.skipped.length > 0, "Should have skipped files");
});

// ── Symlinks: sub-skills discoverable at top level ──

test("Skill scope creates top-level symlinks for sub-skills", () => {
  const dir = path.join(TMP, "symlinks");
  const s = path.join(dir, "skills");
  const g = path.join(dir, "gov");
  installFiles({
    skillPathAbsolute: s,
    governancePath: g,
    scope: "skill",
    projectType: "new",
    stateTracking: false,
  });
  // Check a few key symlinks exist and resolve correctly
  for (const name of ["yp-help", "manage-global-skills", "caveman"]) {
    const link = path.join(s, name);
    const stat = fs.lstatSync(link);
    assert(stat.isSymbolicLink(), `${name} should be a symlink`);
    assert(
      fs.existsSync(path.join(link, "SKILL.md")),
      `${name}/SKILL.md should resolve through symlink`,
    );
  }
});

test("Minimal scope does NOT create symlinks", () => {
  const dir = path.join(TMP, "minimal-sym");
  const s = path.join(dir, "skills");
  const g = path.join(dir, "gov");
  installFiles({
    skillPathAbsolute: s,
    governancePath: g,
    scope: "minimal",
    projectType: "new",
    stateTracking: false,
  });
  // No sub-skill dirs installed, so no symlinks
  const entries = fs.readdirSync(s);
  const symlinks = entries.filter((e) => {
    try { return fs.lstatSync(path.join(s, e)).isSymbolicLink(); }
    catch { return false; }
  });
  assert(symlinks.length === 0, `Expected 0 symlinks in minimal, got ${symlinks.length}`);
});

// ── Clean install: removes stale files from previous version ──

test("Fresh install removes stale files from previous version", () => {
  const dir = path.join(TMP, "clean");
  const s = path.join(dir, "skills");
  const g = path.join(dir, "gov");

  // First install
  installFiles({
    skillPathAbsolute: s,
    governancePath: g,
    scope: "skill",
    projectType: "new",
    stateTracking: false,
  });

  // Simulate a stale file from an old version
  const staleFile = path.join(s, "yellowpages", "old-removed-skill", "SKILL.md");
  fs.mkdirSync(path.dirname(staleFile), { recursive: true });
  fs.writeFileSync(staleFile, "stale");
  // Simulate a stale symlink
  fs.symlinkSync("yellowpages/old-removed-skill", path.join(s, "old-removed-skill"));

  // Second install (fresh — projectType "new")
  installFiles({
    skillPathAbsolute: s,
    governancePath: g,
    scope: "skill",
    projectType: "new",
    stateTracking: false,
  });

  assert(!fs.existsSync(staleFile), "Stale file should be removed by clean install");
  assert(!fs.existsSync(path.join(s, "old-removed-skill")), "Stale symlink should be removed");
  // Real files still present
  assert(fs.existsSync(path.join(s, "yellowpages", "SKILL.md")), "Fresh files should exist");
});

test("Non-destructive install does NOT clean previous files", () => {
  const dir = path.join(TMP, "no-clean");
  const s = path.join(dir, "skills");
  const g = path.join(dir, "gov");

  // First install
  installFiles({
    skillPathAbsolute: s,
    governancePath: g,
    scope: "skill",
    projectType: "new",
    stateTracking: false,
  });

  // Add custom file
  const customFile = path.join(s, "yellowpages", "my-custom-skill", "SKILL.md");
  fs.mkdirSync(path.dirname(customFile), { recursive: true });
  fs.writeFileSync(customFile, "custom");

  // Second install as "existing"
  installFiles({
    skillPathAbsolute: s,
    governancePath: g,
    scope: "skill",
    projectType: "existing",
    stateTracking: false,
  });

  assert(fs.existsSync(customFile), "Custom file should survive non-destructive install");
});

// ── Run ──

console.log("\n🧪 yp-stack install tests\n");

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

// Cleanup
fs.rmSync(TMP, { recursive: true, force: true });

process.exit(failed > 0 ? 1 : 0);
