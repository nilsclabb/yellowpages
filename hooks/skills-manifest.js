#!/usr/bin/env node
/**
 * skills-manifest.js — SessionStart hook
 *
 * Scans global and project skill directories. Emits a compact manifest
 * as invisible system context (Claude reads it, developer never sees it).
 *
 * Read-only scan. Silent-fails on all errors — must never block session start.
 * If scan fails entirely, emits a fallback manifest.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const HOME = os.homedir();
const CWD = process.cwd();

// Fallback emitted if scan fails completely
const FALLBACK = '[YP · manifest scan failed · /diagnose to check]';

// Version injected by bundler at bundle time (replaced in src/hooks.js).
// In source, reads from package.json at repo-relative path as fallback.
const BUNDLED_VERSION = null;
function getVersion(config) {
  if (config?.version) return config.version;
  if (BUNDLED_VERSION) return BUNDLED_VERSION;
  try {
    const pkg = JSON.parse(fs.readFileSync(
      path.join(HOME, '.claude', 'skills', 'yellowpages', '.yp-version'),
      'utf-8',
    ));
    return pkg.version || '?';
  } catch { return '?'; }
}

// Parse YAML frontmatter from a SKILL.md file.
// Returns { name, description, command, argumentHint } or null on failure.
function parseFrontmatter(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = /^---\n([\s\S]*?)\n---/.exec(content);
    if (!match) return null;
    const yaml = match[1];
    const get = (key) => {
      // Handle both inline values and YAML `>` multiline
      const re = new RegExp(`^${key}:\\s*(.+)$`, 'm');
      const m = re.exec(yaml);
      return m ? m[1].trim().replace(/^["']|["']$/g, '') : undefined;
    };
    return {
      name: get('name'),
      description: get('description'),
      command: get('command'),
      argumentHint: get('argumentHint'),
    };
  } catch { return null; }
}

// Scan yellowpages skill directories and build the skill registry from SKILL.md frontmatter.
// Returns { skillNames: Set<string>, commands: string[] }
function scanSkillRegistry(ypSkillsPath) {
  const dirs = listDirs(ypSkillsPath);
  const skillNames = new Set();
  const commands = [];
  for (const dir of dirs) {
    const skillMd = path.join(ypSkillsPath, dir, 'SKILL.md');
    const fm = parseFrontmatter(skillMd);
    if (!fm || !fm.name) continue;
    skillNames.add(dir);
    if (fm.command) {
      const cmd = fm.argumentHint ? `${fm.command} ${fm.argumentHint}` : fm.command;
      commands.push(cmd);
    }
  }
  return { skillNames, commands };
}

function listDirs(p) {
  try { return fs.readdirSync(p).filter(n => fs.statSync(path.join(p, n)).isDirectory()); }
  catch { return []; }
}

function fileExists(p) {
  try { return fs.existsSync(p); }
  catch { return false; }
}

function readConfig() {
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(CWD, 'yellowpages.config.json'), 'utf-8'));
    return cfg;
  } catch { return null; }
}

function countTaskStates(tasksPath) {
  try {
    const content = fs.readFileSync(tasksPath, 'utf-8');
    const done = (content.match(/- \[X\]/g) || []).length;
    const inProgress = (content.match(/- \[\/\]/g) || []).length;
    const pending = (content.match(/- \[ \]/g) || []).length;
    const blocked = (content.match(/- \[!\]/g) || []).length;
    return { done, inProgress, pending, blocked };
  } catch { return null; }
}

try {
  // Determine skill paths — check multiple locations, first match wins
  const config = readConfig();
  const candidateBases = [];
  if (config?.skillPath) candidateBases.push(path.join(CWD, config.skillPath));
  candidateBases.push(path.join(HOME, '.claude', 'skills'));
  candidateBases.push(path.join(HOME, '.agents', 'skills'));

  // Pick the first base that has a yellowpages/ subdirectory with skills
  let skillsBase = candidateBases[0];
  for (const base of candidateBases) {
    const yp = path.join(base, 'yellowpages');
    if (listDirs(yp).length > 0) {
      skillsBase = base;
      break;
    }
  }

  // Layer 1: yellowpages skills — derived from SKILL.md frontmatter
  const ypSkillsPath = path.join(skillsBase, 'yellowpages');
  const registry = scanSkillRegistry(ypSkillsPath);
  const installedYP = listDirs(ypSkillsPath).filter(n => registry.skillNames.has(n));

  // Layer 2: all global skills
  const allGlobal = listDirs(skillsBase);
  const ypCount = installedYP.length;
  // Detect superpowers from settings.json
  let superpowersCount = 0;
  try {
    const settings = JSON.parse(fs.readFileSync(path.join(HOME, '.claude', 'settings.json'), 'utf-8'));
    const plugins = settings.enabledPlugins || {};
    if (Object.keys(plugins).some(k => k.startsWith('superpowers'))) {
      superpowersCount = 15; // known count
    }
  } catch {}
  const otherCount = allGlobal.filter(n => !registry.skillNames.has(n) && n !== 'yellowpages').length;

  // Layer 3: project context
  const hasAgents = fileExists(path.join(CWD, '.agents'));
  const hasClaude = fileExists(path.join(CWD, 'CLAUDE.md'));
  const hasConfig = fileExists(path.join(CWD, 'yellowpages.config.json'));
  const tasksPath = path.join(CWD, 'TASKS.md');
  const hasTasks = fileExists(tasksPath);
  const taskStates = hasTasks ? countTaskStates(tasksPath) : null;

  // Build manifest lines
  const ypLine = `[YP v${getVersion(config)} · ${installedYP.length ? installedYP.join('✓ ') + '✓' : 'no yp skills installed'}]`;
  const globalLine = `[GLOBAL: yellowpages(${ypCount}) superpowers(${superpowersCount}) other(${otherCount})]`;
  const projectParts = [
    hasAgents ? '.agents/✓' : '.agents/✗',
    hasClaude ? 'CLAUDE.md✓' : 'CLAUDE.md✗',
    hasConfig ? `yp-config✓ platform:${config?.platform || '?'}` : 'yp-config✗',
    taskStates ? `TASKS.md: ${taskStates.done} done · ${taskStates.inProgress} in-progress · ${taskStates.pending} pending` : '',
  ].filter(Boolean).join(' · ');
  const projectLine = `[PROJECT: ${projectParts}]`;
  const cmdLine = registry.commands.length
    ? `[COMMANDS: ${registry.commands.join(' ')}]`
    : '[COMMANDS: none discovered — run /yp:diagnose]';

  process.stdout.write([ypLine, globalLine, projectLine, cmdLine].join('\n') + '\n');
} catch {
  process.stdout.write(FALLBACK + '\n');
}
