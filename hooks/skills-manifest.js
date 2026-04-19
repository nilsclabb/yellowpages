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
import { spawn } from 'node:child_process';

const HOME = os.homedir();
const CWD = process.cwd();
const STATE_DIR = process.env.YP_STATE_DIR || path.join(HOME, '.yellowpages');

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

// ── Update check (inlined, sync) ─────────────────────────────────────────────
//
// Reads ~/.yellowpages/ state files synchronously and emits at most one
// marker line. Any network refresh happens in a detached child so session
// start is never blocked.

const SEMVER_RE = /^\d+\.\d+\.\d+$/;
const TTL_UP_TO_DATE_MS = 60 * 60 * 1000;
const TTL_UPGRADE_AVAILABLE_MS = 12 * 60 * 60 * 1000;

function isValidVersion(v) { return typeof v === 'string' && SEMVER_RE.test(v); }

function updateCheckEnabled() {
  // Respect `update_check: false` in ~/.yellowpages/config.yaml. Defaults to on.
  try {
    const raw = fs.readFileSync(path.join(STATE_DIR, 'config.yaml'), 'utf-8');
    const match = /^update_check\s*:\s*(\S+)/m.exec(raw);
    if (!match) return true;
    return match[1].trim() !== 'false';
  } catch { return true; }
}

function readCacheLine() {
  try {
    const raw = fs.readFileSync(path.join(STATE_DIR, 'last-update-check'), 'utf-8').trim();
    if (!raw) return null;
    const parts = raw.split(/\s+/);
    if (parts[0] === 'UP_TO_DATE' && parts.length >= 3) {
      const [, local, tsStr] = parts;
      const ts = parseInt(tsStr, 10);
      if (!isValidVersion(local) || !Number.isFinite(ts)) return null;
      return { kind: 'UP_TO_DATE', local, timestamp: ts };
    }
    if (parts[0] === 'UPGRADE_AVAILABLE' && parts.length >= 4) {
      const [, local, remote, tsStr] = parts;
      const ts = parseInt(tsStr, 10);
      if (!isValidVersion(local) || !isValidVersion(remote) || !Number.isFinite(ts)) return null;
      return { kind: 'UPGRADE_AVAILABLE', local, remote, timestamp: ts };
    }
    return null;
  } catch { return null; }
}

function readSnoozeEntry() {
  try {
    const raw = fs.readFileSync(path.join(STATE_DIR, 'update-snoozed'), 'utf-8').trim();
    const parts = raw.split(/\s+/);
    if (parts.length < 3 || !isValidVersion(parts[0])) return null;
    const level = parseInt(parts[1], 10);
    const ts = parseInt(parts[2], 10);
    if (!Number.isFinite(level) || !Number.isFinite(ts)) return null;
    return { version: parts[0], level, timestamp: ts };
  } catch { return null; }
}

function snoozeMs(level) {
  if (level === 1) return 24 * 60 * 60 * 1000;
  if (level === 2) return 48 * 60 * 60 * 1000;
  return 7 * 24 * 60 * 60 * 1000;
}

function consumeJustUpgraded() {
  // Read + delete ~/.yellowpages/just-upgraded-from. Returns version or null.
  try {
    const p = path.join(STATE_DIR, 'just-upgraded-from');
    const raw = fs.readFileSync(p, 'utf-8').trim();
    try { fs.unlinkSync(p); } catch {}
    return isValidVersion(raw) ? raw : null;
  } catch { return null; }
}

function cacheStale(entry, now) {
  if (!entry) return true;
  const ttl = entry.kind === 'UP_TO_DATE' ? TTL_UP_TO_DATE_MS : TTL_UPGRADE_AVAILABLE_MS;
  return now - entry.timestamp >= ttl;
}

function spawnRefresher(localVersion) {
  // Fire-and-forget: refresh the cache in the background so the hook never
  // waits on network. The child writes ~/.yellowpages/last-update-check
  // using vanilla https + fs. Failures are silent.
  const url = process.env.YP_REMOTE_VERSION_URL ||
    'https://raw.githubusercontent.com/nilsclabb/yellowpages/main/packages/yp-stack/package.json';
  const script = `
    const https = require('node:https');
    const fs = require('node:fs');
    const path = require('node:path');
    const STATE = ${JSON.stringify(STATE_DIR)};
    const LOCAL = ${JSON.stringify(localVersion)};
    const URL = ${JSON.stringify(url)};
    const SEMVER = /^\\d+\\.\\d+\\.\\d+$/;
    function cmp(a,b){const pa=a.split('.').map(Number),pb=b.split('.').map(Number);for(let i=0;i<3;i++){if(pa[i]>pb[i])return 1;if(pa[i]<pb[i])return -1;}return 0;}
    try { fs.mkdirSync(STATE, { recursive: true }); } catch {}
    const req = https.get(URL, { timeout: 5000 }, (res) => {
      if (res.statusCode !== 200) { res.resume(); return; }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        try {
          const pkg = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
          const remote = pkg && pkg.version;
          if (!SEMVER.test(remote) || !SEMVER.test(LOCAL)) return;
          const now = Date.now();
          let line;
          if (cmp(remote, LOCAL) > 0) {
            line = 'UPGRADE_AVAILABLE ' + LOCAL + ' ' + remote + ' ' + now;
            // Reset snooze if it targeted an older remote.
            try {
              const snoozePath = path.join(STATE, 'update-snoozed');
              const raw = fs.readFileSync(snoozePath, 'utf-8').trim();
              const priorVer = raw.split(/\\s+/)[0];
              if (SEMVER.test(priorVer) && priorVer !== remote) fs.unlinkSync(snoozePath);
            } catch {}
          } else {
            line = 'UP_TO_DATE ' + LOCAL + ' ' + now;
          }
          fs.writeFileSync(path.join(STATE, 'last-update-check'), line + '\\n', 'utf-8');
        } catch {}
      });
      res.on('error', () => {});
    });
    req.on('timeout', () => req.destroy());
    req.on('error', () => {});
  `;
  try {
    const child = spawn(process.execPath, ['-e', script], {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();
  } catch {
    // Best-effort: missing node binary shouldn't break the hook.
  }
}

function updateMarker(localVersion) {
  try {
    // Upgrade-just-happened banner surfaces exactly once, always.
    const prev = consumeJustUpgraded();
    if (prev && isValidVersion(localVersion)) {
      return `[YP_JUST_UPGRADED ${prev} → ${localVersion}]`;
    }
    if (!updateCheckEnabled()) return null;
    if (!isValidVersion(localVersion)) return null;

    const now = Date.now();
    const cached = readCacheLine();
    const localMismatch = cached && cached.local !== localVersion;

    // Background refresh when cache is missing, stale, or mismatched against
    // the binary we are running. Never blocks.
    if (!cached || localMismatch || cacheStale(cached, now)) {
      spawnRefresher(localVersion);
    }

    if (!cached || cached.kind !== 'UPGRADE_AVAILABLE' || localMismatch) return null;

    const snooze = readSnoozeEntry();
    if (snooze && snooze.version === cached.remote && now - snooze.timestamp < snoozeMs(snooze.level)) {
      return null;
    }
    return `[YP_UPGRADE_AVAILABLE ${cached.local} ${cached.remote} · snooze: yp-stack snooze]`;
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
    : '[COMMANDS: none discovered — run /yp-diagnose]';

  const lines = [ypLine, globalLine, projectLine, cmdLine];
  const upgradeLine = updateMarker(getVersion(config));
  if (upgradeLine) lines.push(upgradeLine);
  process.stdout.write(lines.join('\n') + '\n');
} catch {
  process.stdout.write(FALLBACK + '\n');
}
