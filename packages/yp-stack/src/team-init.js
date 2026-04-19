/**
 * team-init.js — implements `npx yp-stack --team {optional|required}`.
 *
 * The --team flow writes a small, committable enforcement kit into the
 * project repo instead of vendoring the full yellowpages skill tree.
 *
 * Files written (both modes):
 *   - CLAUDE.md                   appended section, marker-wrapped, deduped
 *   - .gitignore                  adds `.claude/skills/yellowpages/` (deduped)
 *
 * Files written (required mode only):
 *   - .claude/hooks/check-yp.sh   bash hook from templates/check-yp.sh (chmod +x)
 *   - .claude/settings.json       PreToolUse hook registered for Skill matcher
 *
 * Vendored-install migration:
 *   If `.claude/skills/yellowpages/` exists as a real directory (not a symlink),
 *   team-init runs `git rm -r --cached` + deletes the directory, after the user
 *   confirms (interactive) or when --yes is passed.
 *
 * Preconditions:
 *   - cwd must be inside a git repo (`git rev-parse --show-toplevel` succeeds).
 *
 * All writes are idempotent: running team-init twice produces the same file
 * contents as running it once.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MODES = ["optional", "required"];
const MARKER_START = "<!-- yellowpages:start -->";
const MARKER_END = "<!-- yellowpages:end -->";
const GITIGNORE_ENTRY = ".claude/skills/yellowpages/";
const HOOK_MATCHER = "Skill";
const HOOK_COMMAND_FRAGMENT = "check-yp";

// ── Helpers ──────────────────────────────────────────────────────────────────

function templatePath(name) {
  return path.join(__dirname, "templates", name);
}

function readTemplate(name) {
  return fs.readFileSync(templatePath(name), "utf-8");
}

function assertGitRepo(cwd) {
  try {
    execSync("git rev-parse --show-toplevel", { cwd, stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    throw new Error(
      `--team requires a git repository. Not a git repo: ${cwd}\n` +
        `Run 'git init' first, or cd into an existing repo.`,
    );
  }
}

export function isValidMode(mode) {
  return MODES.includes(mode);
}

export function modes() {
  return [...MODES];
}

// ── CLAUDE.md ────────────────────────────────────────────────────────────────

/**
 * Idempotently append (or replace) the yellowpages section in CLAUDE.md.
 * Returns { path, status: 'created' | 'updated' | 'unchanged' }.
 */
export function updateClaudeMd(cwd, mode) {
  if (!isValidMode(mode)) {
    throw new Error(`invalid mode: ${mode}. expected one of ${MODES.join(", ")}`);
  }

  const target = path.join(cwd, "CLAUDE.md");
  const template = readTemplate(`claude-md-${mode}.md`).trimEnd();

  let existing = "";
  let exists = false;
  try {
    existing = fs.readFileSync(target, "utf-8");
    exists = true;
  } catch {
    existing = "";
  }

  const startIdx = existing.indexOf(MARKER_START);
  const endIdx = existing.indexOf(MARKER_END);

  let next;
  let status;

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    // Replace existing yp block.
    const before = existing.slice(0, startIdx).replace(/\s+$/, "");
    const after = existing.slice(endIdx + MARKER_END.length).replace(/^\s+/, "");
    const rebuilt = (before ? before + "\n\n" : "") + template + "\n" + (after ? "\n" + after : "");
    if (rebuilt === existing) {
      status = "unchanged";
      next = existing;
    } else {
      status = "updated";
      next = rebuilt;
    }
  } else {
    // Append new block.
    const prefix = existing.length === 0 ? "" : existing.replace(/\s+$/, "") + "\n\n";
    next = prefix + template + "\n";
    status = exists ? "updated" : "created";
  }

  atomicWrite(target, next);
  return { path: target, status };
}

// ── .gitignore ───────────────────────────────────────────────────────────────

/**
 * Append the vendored-skills ignore entry to .gitignore. Idempotent.
 * Returns { path, status: 'created' | 'updated' | 'unchanged' }.
 */
export function updateGitignore(cwd) {
  const target = path.join(cwd, ".gitignore");
  let existing = "";
  let exists = false;
  try {
    existing = fs.readFileSync(target, "utf-8");
    exists = true;
  } catch {
    existing = "";
  }

  const lines = existing.split("\n").map((l) => l.trim());
  if (lines.includes(GITIGNORE_ENTRY) || lines.includes(GITIGNORE_ENTRY.replace(/\/$/, ""))) {
    return { path: target, status: "unchanged" };
  }

  const prefix = existing.length === 0 || existing.endsWith("\n") ? existing : existing + "\n";
  const next = prefix + GITIGNORE_ENTRY + "\n";
  atomicWrite(target, next);
  return { path: target, status: exists ? "updated" : "created" };
}

// ── .claude/hooks/check-yp.sh ────────────────────────────────────────────────

/**
 * Write the PreToolUse bash hook. Overwrites any existing copy (managed file).
 * Returns { path, status: 'created' | 'updated' | 'unchanged' }.
 */
export function writeCheckHook(cwd) {
  const hooksDir = path.join(cwd, ".claude", "hooks");
  fs.mkdirSync(hooksDir, { recursive: true });
  const target = path.join(hooksDir, "check-yp.sh");
  const contents = readTemplate("check-yp.sh");

  let prior = null;
  try {
    prior = fs.readFileSync(target, "utf-8");
  } catch {
    prior = null;
  }

  let status;
  if (prior === contents) {
    status = "unchanged";
  } else {
    atomicWrite(target, contents);
    status = prior === null ? "created" : "updated";
  }

  try {
    fs.chmodSync(target, 0o755);
  } catch {
    // Best-effort: some filesystems (e.g. FAT) ignore chmod.
  }
  return { path: target, status };
}

// ── .claude/settings.json ────────────────────────────────────────────────────

/**
 * Register the PreToolUse hook in .claude/settings.json. Idempotent.
 * Returns { path, status: 'created' | 'updated' | 'unchanged' }.
 */
export function patchSettingsJson(cwd) {
  const target = path.join(cwd, ".claude", "settings.json");
  fs.mkdirSync(path.dirname(target), { recursive: true });

  let settings = {};
  let exists = false;
  let priorRaw = null;
  try {
    priorRaw = fs.readFileSync(target, "utf-8");
    exists = true;
    try {
      settings = JSON.parse(priorRaw);
      if (settings === null || typeof settings !== "object" || Array.isArray(settings)) {
        settings = {};
      }
    } catch {
      throw new Error(
        `.claude/settings.json exists but is not valid JSON. Fix or remove it, then retry.`,
      );
    }
  } catch (err) {
    if (exists) throw err; // parse error bubbles up
  }

  if (!settings.hooks || typeof settings.hooks !== "object") settings.hooks = {};
  if (!Array.isArray(settings.hooks.PreToolUse)) settings.hooks.PreToolUse = [];

  const entries = settings.hooks.PreToolUse;
  const command = '"$CLAUDE_PROJECT_DIR/.claude/hooks/check-yp.sh"';
  const desired = {
    matcher: HOOK_MATCHER,
    hooks: [{ type: "command", command }],
  };

  const existingIdx = entries.findIndex((e) => {
    if (!e || e.matcher !== HOOK_MATCHER) return false;
    if (!Array.isArray(e.hooks)) return false;
    return e.hooks.some(
      (h) => h && typeof h.command === "string" && h.command.includes(HOOK_COMMAND_FRAGMENT),
    );
  });

  if (existingIdx === -1) {
    entries.push(desired);
  } else {
    // Normalise the matched entry to the canonical shape.
    entries[existingIdx] = desired;
  }

  const nextRaw = JSON.stringify(settings, null, 2) + "\n";
  if (nextRaw === priorRaw) {
    return { path: target, status: "unchanged" };
  }
  atomicWrite(target, nextRaw);
  return { path: target, status: exists ? "updated" : "created" };
}

// ── Vendored-install migration ───────────────────────────────────────────────

/**
 * If `.claude/skills/yellowpages/` exists as a real directory in the repo,
 * remove it from the git index and the working tree. No-op if the directory
 * is absent or a symlink (symlink = global install already canonical).
 *
 * Returns { migrated: boolean, path, removed: string[] }.
 */
export function migrateVendoredInstall(cwd) {
  const target = path.join(cwd, ".claude", "skills", "yellowpages");
  let stat;
  try {
    stat = fs.lstatSync(target);
  } catch {
    return { migrated: false, path: target, removed: [] };
  }

  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    return { migrated: false, path: target, removed: [] };
  }

  const removed = [];

  // Untrack from git (tolerate not-in-index cases).
  try {
    execSync(`git rm -r --cached --quiet "${target}"`, {
      cwd,
      stdio: ["ignore", "ignore", "ignore"],
    });
    removed.push("git index");
  } catch {
    // Directory was never committed — safe to skip.
  }

  // Remove the real directory.
  fs.rmSync(target, { recursive: true, force: true });
  removed.push("working tree");

  return { migrated: true, path: target, removed };
}

// ── Orchestrator ─────────────────────────────────────────────────────────────

/**
 * Run the full team-init flow. Returns a record of every file touched.
 *
 * @param {object} opts
 * @param {'optional'|'required'} opts.mode
 * @param {string} opts.cwd
 * @param {boolean} [opts.migrate]   run vendored-install migration (default true)
 */
export function runTeamInit({ mode, cwd, migrate = true }) {
  if (!isValidMode(mode)) {
    throw new Error(`invalid --team mode: ${mode}. expected one of ${MODES.join(", ")}`);
  }
  assertGitRepo(cwd);

  const steps = [];

  if (migrate) {
    const m = migrateVendoredInstall(cwd);
    if (m.migrated) steps.push({ kind: "migrated", ...m });
  }

  steps.push({ kind: "claude-md", ...updateClaudeMd(cwd, mode) });
  steps.push({ kind: "gitignore", ...updateGitignore(cwd) });

  if (mode === "required") {
    steps.push({ kind: "check-hook", ...writeCheckHook(cwd) });
    steps.push({ kind: "settings-json", ...patchSettingsJson(cwd) });
  }

  return { mode, cwd, steps };
}

// ── Atomic write helper ──────────────────────────────────────────────────────

function atomicWrite(target, contents) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const tmp = `${target}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmp, contents, "utf-8");
  fs.renameSync(tmp, target);
}
