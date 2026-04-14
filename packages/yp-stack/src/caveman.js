/**
 * caveman.js — Caveman terse mode installer for yp-stack
 *
 * Exports installCaveman(platform, cwd) and uninstallCaveman(platform, cwd).
 * Hook content is auto-generated from hooks/ source files by the bundler
 * into src/hooks.js — no manual sync needed.
 *
 * Credit: Julius Brussee / https://github.com/JuliusBrussee/caveman
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { CAVEMAN_ACTIVATE_HOOK, CAVEMAN_TRACKER_HOOK } from "./hooks.js";

// ─── Rule body (also baked into caveman-activate.js hook) ───────────────────

export const RULE_BODY = `Respond terse like smart caveman. All technical substance stay. Only fluff die.
Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging.
Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
Pattern: [thing] [action] [reason]. [next step].
Switch level: /caveman lite|full|ultra
Stop: "stop caveman" or "normal mode"
Auto-Clarity: drop caveman for security warnings, irreversible actions, user confused. Resume after.
Boundaries: written artifacts (skills, specs, docs, reference files) NEVER caveman.
Code/commits/PRs: normal formatting.`;

// ─── Platform-to-path map ────────────────────────────────────────────────────

const PLATFORM_RULE_PATHS = {
  cursor: (cwd) => path.join(cwd, ".cursor", "rules", "caveman.mdc"),
  windsurf: (cwd) => path.join(cwd, ".windsurf", "rules", "caveman.md"),
  cline: (cwd) => path.join(cwd, ".clinerules", "caveman.md"),
  roo: (cwd) => path.join(cwd, ".roo", "rules", "caveman.md"),
  opencode: (cwd) => path.join(cwd, ".opencode", "rules", "caveman.md"),
  copilot: (cwd) => path.join(cwd, ".github", "copilot-instructions.md"),
};

const FRONTMATTER = {
  cursor: "---\nalwaysApply: true\n---\n\n",
  windsurf: "---\ntrigger: always_on\n---\n\n",
};

const COPILOT_START = "<!-- caveman:start -->";
const COPILOT_END = "<!-- caveman:end -->";

// ─── Install ─────────────────────────────────────────────────────────────────

export function installCaveman(platform, cwd = process.cwd()) {
  if (platform === "claude") {
    _installClaudeCode();
    return;
  }
  if (platform === "generic" || platform === "custom") {
    console.log("\nCaveman always-on snippet (paste into your agent system prompt):\n");
    console.log(RULE_BODY);
    return;
  }
  if (platform === "copilot") {
    _installCopilot(cwd);
    return;
  }
  const rulePath = PLATFORM_RULE_PATHS[platform]?.(cwd);
  if (!rulePath) return;
  const frontmatter = FRONTMATTER[platform] ?? "";
  fs.mkdirSync(path.dirname(rulePath), { recursive: true });
  fs.writeFileSync(rulePath, frontmatter + RULE_BODY + "\n", "utf-8");
}

function _installClaudeCode() {
  const hooksDir = path.join(os.homedir(), ".claude", "hooks");
  const rulesDir = path.join(os.homedir(), ".claude", "rules");
  const settingsPath = path.join(os.homedir(), ".claude", "settings.json");
  const activateCmd = `node ${path.join(hooksDir, "caveman-activate.js")}`;
  const trackerCmd = `node ${path.join(hooksDir, "caveman-mode-tracker.js")}`;

  fs.mkdirSync(hooksDir, { recursive: true });
  fs.writeFileSync(path.join(hooksDir, "package.json"), '{"type":"module"}\n', "utf-8");
  fs.mkdirSync(rulesDir, { recursive: true });
  fs.writeFileSync(path.join(hooksDir, "caveman-activate.js"), CAVEMAN_ACTIVATE_HOOK, "utf-8");
  fs.writeFileSync(path.join(hooksDir, "caveman-mode-tracker.js"), CAVEMAN_TRACKER_HOOK, "utf-8");
  fs.writeFileSync(path.join(rulesDir, "caveman-activate.md"), RULE_BODY + "\n", "utf-8");

  let settings = {};
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
  } catch {}
  settings.hooks ??= {};
  settings.hooks.SessionStart ??= [];
  settings.hooks.UserPromptSubmit ??= [];

  const hasCmd = (arr, cmd) => arr.some((h) => (h?.hooks ?? []).some((e) => e?.command === cmd));
  if (!hasCmd(settings.hooks.SessionStart, activateCmd))
    settings.hooks.SessionStart.push({ hooks: [{ type: "command", command: activateCmd }] });
  if (!hasCmd(settings.hooks.UserPromptSubmit, trackerCmd))
    settings.hooks.UserPromptSubmit.push({ hooks: [{ type: "command", command: trackerCmd }] });

  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf-8");
}

function _installCopilot(cwd) {
  const filePath = path.join(cwd, ".github", "copilot-instructions.md");
  const block = `\n${COPILOT_START}\n${RULE_BODY}\n${COPILOT_END}\n`;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, "utf-8");
    if (existing.includes(COPILOT_START)) return;
    fs.appendFileSync(filePath, block, "utf-8");
  } else {
    fs.writeFileSync(filePath, block.trimStart(), "utf-8");
  }
}

// ─── Uninstall ───────────────────────────────────────────────────────────────

export function uninstallCaveman(platform, cwd = process.cwd()) {
  if (platform === "claude") {
    _uninstallClaudeCode();
    return;
  }
  if (platform === "generic" || platform === "custom") {
    console.log("Remove the caveman snippet from your agent system prompt manually.");
    return;
  }
  if (platform === "copilot") {
    _uninstallCopilot(cwd);
    return;
  }
  const rulePath = PLATFORM_RULE_PATHS[platform]?.(cwd);
  if (rulePath)
    try {
      fs.unlinkSync(rulePath);
    } catch {
      /* already gone */
    }
}

function _uninstallClaudeCode() {
  const hooksDir = path.join(os.homedir(), ".claude", "hooks");
  const settingsPath = path.join(os.homedir(), ".claude", "settings.json");
  const flagFile = path.join(os.homedir(), ".claude", ".caveman-active");
  const rulesFile = path.join(os.homedir(), ".claude", "rules", "caveman-activate.md");
  const activateCmd = `node ${path.join(hooksDir, "caveman-activate.js")}`;
  const trackerCmd = `node ${path.join(hooksDir, "caveman-mode-tracker.js")}`;

  try {
    fs.unlinkSync(path.join(hooksDir, "caveman-activate.js"));
  } catch {}
  try {
    fs.unlinkSync(path.join(hooksDir, "caveman-mode-tracker.js"));
  } catch {}
  try {
    fs.unlinkSync(path.join(hooksDir, "package.json"));
  } catch {}
  try {
    fs.unlinkSync(flagFile);
  } catch {}
  try {
    fs.unlinkSync(rulesFile);
  } catch {}

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
    settings.hooks.SessionStart = removeCmd(settings.hooks.SessionStart, activateCmd);
    settings.hooks.UserPromptSubmit = removeCmd(settings.hooks.UserPromptSubmit, trackerCmd);
  }
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n", "utf-8");
}

function _uninstallCopilot(cwd) {
  const filePath = path.join(cwd, ".github", "copilot-instructions.md");
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, "utf-8");
  const start = content.indexOf(COPILOT_START);
  const end = content.indexOf(COPILOT_END);
  if (start === -1 || end === -1 || end < start) return;
  content =
    content.slice(0, start).trimEnd() + "\n" + content.slice(end + COPILOT_END.length).trimStart();
  fs.writeFileSync(filePath, content || "", "utf-8");
}
