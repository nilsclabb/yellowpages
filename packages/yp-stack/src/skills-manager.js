/**
 * skills-manager.js — YP Skills Manager installer for yp-stack
 *
 * Exports installSkillsManager(platform, cwd) and
 * uninstallSkillsManager(platform, cwd).
 *
 * Hook content is auto-generated from hooks/ source files by the bundler
 * into src/hooks.js — no manual sync needed.
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { getPlatform } from "./platforms.js";
import { MANIFEST_HOOK } from "./hooks.js";
import { cleanPreviousInstall } from "./install.js";

// Re-export for external consumers
export { MANIFEST_HOOK };

// ─── Install ─────────────────────────────────────────────────────────────────

export function installSkillsManager(platform, _cwd = process.cwd()) {
  if (platform === "claude") {
    _installClaudeCode();
  }
  // Skill files are already installed by installFiles() via content.js FILES map.
  // No per-platform rule files needed — skill dirs are enough.
}

function _installClaudeCode() {
  const hooksDir = path.join(os.homedir(), ".claude", "hooks");
  const settingsPath = path.join(os.homedir(), ".claude", "settings.json");
  const manifestCmd = `node ${path.join(hooksDir, "skills-manifest.js")}`;

  // Ensure hooks dir + package.json
  fs.mkdirSync(hooksDir, { recursive: true });
  const pkgPath = path.join(hooksDir, "package.json");
  let pkg = {};
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  } catch {}
  if (pkg.type !== "module") {
    pkg.type = "module";
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
  }

  // Write hook file
  fs.writeFileSync(path.join(hooksDir, "skills-manifest.js"), MANIFEST_HOOK, "utf-8");

  // Patch settings.json — idempotent (hasCmd check)
  let settings = {};
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
  } catch {}
  settings.hooks ??= {};
  settings.hooks.SessionStart ??= [];
  const hasCmd = (arr, cmd) => arr.some((h) => (h?.hooks ?? []).some((e) => e?.command === cmd));
  if (!hasCmd(settings.hooks.SessionStart, manifestCmd)) {
    settings.hooks.SessionStart.push({ hooks: [{ type: "command", command: manifestCmd }] });
  }
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf-8");
}

// ─── Uninstall ───────────────────────────────────────────────────────────────

export function uninstallSkillsManager(platform, cwd = process.cwd()) {
  if (platform === "claude") {
    _uninstallClaudeCode();
  }
  // Derive skill path from yellowpages.config.json
  let skillPathAbsolute;
  try {
    const config = JSON.parse(fs.readFileSync(path.join(cwd, "yellowpages.config.json"), "utf-8"));
    const platformDef = getPlatform(platform);
    const isGlobal = config.installLocation === "global";
    if (isGlobal) {
      skillPathAbsolute =
        platformDef?.globalSkillPath ?? path.join(os.homedir(), ".claude", "skills");
    } else {
      skillPathAbsolute = path.join(cwd, platformDef?.skillPath ?? ".claude/skills");
    }
  } catch {
    const platformDef = getPlatform(platform);
    skillPathAbsolute =
      platformDef?.globalSkillPath ?? path.join(os.homedir(), ".claude", "skills");
  }
  // Remove yellowpages package dir + top-level symlinks
  cleanPreviousInstall(skillPathAbsolute);
}

function _uninstallClaudeCode() {
  const hooksDir = path.join(os.homedir(), ".claude", "hooks");
  const settingsPath = path.join(os.homedir(), ".claude", "settings.json");
  const manifestCmd = `node ${path.join(hooksDir, "skills-manifest.js")}`;

  // Remove hook file
  try {
    fs.unlinkSync(path.join(hooksDir, "skills-manifest.js"));
  } catch {}

  // Strip hook entry from settings.json
  let settings = {};
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
  } catch {
    return;
  }
  const removeCmd = (arr, cmd) =>
    (arr ?? [])
      .map((h) => ({ ...h, hooks: (h.hooks ?? []).filter((e) => e?.command !== cmd) }))
      .filter((h) => h.hooks.length > 0);
  if (settings.hooks) {
    settings.hooks.SessionStart = removeCmd(settings.hooks.SessionStart, manifestCmd);
  }
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf-8");
}
