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

// Known yp-stack skill names (used to identify yellowpages skills)
const YP_SKILLS = new Set([
  'caveman','yp-help','yp-status','yp-context','yp-session','yp-reload',
  'yp-notes','yp-remember','yp-forget','manage-global-skills','manage-project-skills',
  'scaffold-skill','validate-skill','yp-diagnose','yp-compress','yp-tasks','auto-plan',
  'yp-upgrade','react-patterns',
  'convex-patterns','frontend-architecture','preferred-stack','ui-component-system','monorepo-setup',
]);

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
    if (listDirs(yp).some(n => YP_SKILLS.has(n))) {
      skillsBase = base;
      break;
    }
  }

  // Layer 1: yellowpages skills
  const ypSkillsPath = path.join(skillsBase, 'yellowpages');
  const installedYP = listDirs(ypSkillsPath).filter(n => YP_SKILLS.has(n));

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
  const otherCount = allGlobal.filter(n => !YP_SKILLS.has(n) && n !== 'yellowpages').length;

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
  const cmdLine = '[COMMANDS: /yp:help /yp:status /yp:context /yp:session /yp:diagnose /yp:scaffold /yp:validate /yp:compress /yp:manage-global /yp:manage-project /yp:remember /yp:forget /yp:notes /yp:reload /yp:tasks /yp:auto-plan /yp:upgrade]';

  process.stdout.write([ypLine, globalLine, projectLine, cmdLine].join('\n') + '\n');
} catch {
  process.stdout.write(FALLBACK + '\n');
}
