/**
 * skills-manager.js — YP Skills Manager installer for yp-stack
 *
 * Exports installSkillsManager(platform, cwd) and
 * uninstallSkillsManager(platform, cwd).
 *
 * installSkillsManager is called from index.js after installFiles —
 * same call-site pattern as installCaveman.
 *
 * Hook content is bundled as a string constant (MANIFEST_HOOK) so this
 * module works from the npm cache without needing the repo's hooks/ directory.
 * Keep MANIFEST_HOOK in sync with hooks/skills-manifest.js when updating.
 */

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { getPlatform } from "./platforms.js";

// ─── Bundled hook content ────────────────────────────────────────────────────

// NOTE: Keep this in sync with hooks/skills-manifest.js
export const MANIFEST_HOOK = `#!/usr/bin/env node
/**
 * skills-manifest.js — SessionStart hook (bundled by yp-stack npm package)
 * Keep in sync with hooks/skills-manifest.js in the yellowpages repo.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const HOME = os.homedir();
const CWD = process.cwd();
const FALLBACK = '[YP · manifest scan failed · /diagnose to check]';
const YP_SKILLS = new Set(['caveman','yp-help','yp-status','yp-context','yp-session','yp-reload','yp-notes','yp-remember','yp-forget','manage-global-skills','manage-project-skills','scaffold-skill','validate-skill','yp-diagnose','yp-compress','yp-tasks','auto-plan','convex-patterns','frontend-architecture','preferred-stack','ui-component-system','monorepo-setup']);
function listDirs(p){try{return fs.readdirSync(p).filter(n=>fs.statSync(path.join(p,n)).isDirectory());}catch{return[];}}
function fileExists(p){try{return fs.existsSync(p);}catch{return false;}}
function readConfig(){try{return JSON.parse(fs.readFileSync(path.join(CWD,'yellowpages.config.json'),'utf-8'));}catch{return null;}}
function countTaskStates(p){try{const c=fs.readFileSync(p,'utf-8');return{done:(c.match(/- \\[X\\]/g)||[]).length,inProgress:(c.match(/- \\[\\/\\]/g)||[]).length,pending:(c.match(/- \\[ \\]/g)||[]).length};}catch{return null;}}
try{
  const config=readConfig();
  const skillsBase=config?.skillPath?path.join(CWD,config.skillPath):path.join(HOME,'.claude','skills');
  const installedYP=listDirs(path.join(skillsBase,'yellowpages')).filter(n=>YP_SKILLS.has(n));
  const allGlobal=listDirs(skillsBase);
  let spCount=0;
  try{const s=JSON.parse(fs.readFileSync(path.join(HOME,'.claude','settings.json'),'utf-8'));if(Object.keys(s.enabledPlugins||{}).some(k=>k.startsWith('superpowers')))spCount=15;}catch{}
  const otherCount=allGlobal.filter(n=>!YP_SKILLS.has(n)&&n!=='yellowpages').length;
  const hasAgents=fileExists(path.join(CWD,'.agents'));
  const hasClaude=fileExists(path.join(CWD,'CLAUDE.md'));
  const hasConfig=fileExists(path.join(CWD,'yellowpages.config.json'));
  const tasksPath=path.join(CWD,'TASKS.md');
  const ts=fileExists(tasksPath)?countTaskStates(tasksPath):null;
  const l1=\`[YP v\${config?.version||'?'} · \${installedYP.length?installedYP.join('✓ ')+'✓':'no yp skills installed'}]\`;
  const l2=\`[GLOBAL: yellowpages(\${installedYP.length}) superpowers(\${spCount}) other(\${otherCount})]\`;
  const pp=[hasAgents?'.agents/✓':'.agents/✗',hasClaude?'CLAUDE.md✓':'CLAUDE.md✗',hasConfig?'yp-config✓':'yp-config✗',ts?\`TASKS.md: \${ts.done} done · \${ts.inProgress} in-progress · \${ts.pending} pending\`:''].filter(Boolean).join(' · ');
  const l3=\`[PROJECT: \${pp}]\`;
  const l4='[COMMANDS: /help /status /context /session /diagnose /scaffold /validate /compress /manage /remember /forget /notes /reload /tasks /auto-plan]';
  process.stdout.write([l1,l2,l3,l4].join('\\n')+'\\n');
}catch{process.stdout.write(FALLBACK+'\\n');}
`;

// ─── Install ─────────────────────────────────────────────────────────────────

export function installSkillsManager(platform, _cwd = process.cwd()) {
  if (platform === "claude") {
    _installClaudeCode();
  }
  // Skill files are already installed by installFiles() via content.js FILES map.
  // No per-platform rule files needed — skill dirs are enough.
  // cwd parameter kept for API symmetry with installCaveman(platform, cwd).
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
  const YP_UTILITY_SKILLS = [
    "yp-help",
    "yp-status",
    "yp-context",
    "yp-session",
    "yp-reload",
    "yp-notes",
    "yp-remember",
    "yp-forget",
    "manage-global-skills",
    "manage-project-skills",
    "scaffold-skill",
    "validate-skill",
    "yp-diagnose",
    "yp-compress",
    "yp-tasks",
    "auto-plan",
  ];
  for (const name of YP_UTILITY_SKILLS) {
    const dir = path.join(skillPathAbsolute, "yellowpages", name);
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch {}
  }
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
