/**
 * caveman.js — Caveman terse mode installer for yp-stack
 *
 * Exports installCaveman(platform, cwd) and uninstallCaveman(platform, cwd).
 * Rule body and hook file content are bundled as string constants so this
 * module works from the npm cache without needing the repo's rules/ directory.
 *
 * Credit: Julius Brussee / https://github.com/JuliusBrussee/caveman
 * Keep RULE_BODY in sync with rules/caveman-activate.md when updating.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// ─── Bundled content ────────────────────────────────────────────────────────

export const RULE_BODY = `Respond terse like smart caveman. All technical substance stay. Only fluff die.
Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging.
Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
Pattern: [thing] [action] [reason]. [next step].
Switch level: /caveman lite|full|ultra
Stop: "stop caveman" or "normal mode"
Auto-Clarity: drop caveman for security warnings, irreversible actions, user confused. Resume after.
Boundaries: written artifacts (skills, specs, docs, reference files) NEVER caveman.
Code/commits/PRs: normal formatting.`;

// Hook file content — written to ~/.claude/hooks/ during Claude Code install
// NOTE: Keep in sync with hooks/caveman-activate.js
const HOOK_ACTIVATE = `#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const FLAG_FILE = path.join(os.homedir(), '.claude', '.caveman-active');
const RULE_BODY = \`Respond terse like smart caveman. All technical substance stay. Only fluff die.
Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging.
Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
Pattern: [thing] [action] [reason]. [next step].
Switch level: /caveman lite|full|ultra
Stop: "stop caveman" or "normal mode"
Auto-Clarity: drop caveman for security warnings, irreversible actions, user confused. Resume after.
Boundaries: written artifacts (skills, specs, docs, reference files) NEVER caveman.
Code/commits/PRs: normal formatting.\`;
try {
  fs.mkdirSync(path.dirname(FLAG_FILE), { recursive: true });
  fs.writeFileSync(FLAG_FILE, 'full', 'utf-8');
  let ruleBody = RULE_BODY;
  try {
    const rulesPath = path.join(os.homedir(), '.claude', 'rules', 'caveman-activate.md');
    ruleBody = fs.readFileSync(rulesPath, 'utf-8').trim();
  } catch {}
  process.stdout.write(ruleBody + '\\n');
} catch {}
`;

// NOTE: Keep in sync with hooks/caveman-mode-tracker.js
const HOOK_TRACKER = `#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const FLAG_FILE = path.join(os.homedir(), '.claude', '.caveman-active');
async function main() {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const input = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
    const prompt = (input?.prompt ?? '').trim().toLowerCase();
    if (prompt.startsWith('/caveman ultra')) fs.writeFileSync(FLAG_FILE, 'ultra', 'utf-8');
    else if (prompt.startsWith('/caveman lite')) fs.writeFileSync(FLAG_FILE, 'lite', 'utf-8');
    else if (prompt.startsWith('/caveman')) fs.writeFileSync(FLAG_FILE, 'full', 'utf-8');
    else if (prompt.includes('stop caveman') || prompt.includes('normal mode')) {
      try { fs.unlinkSync(FLAG_FILE); } catch {}
    }
  } catch {}
  process.exit(0);
}
main();
`;

// ─── Platform-to-path map ────────────────────────────────────────────────────
// Not in platforms.js (which carries only skill paths). Maintained here.

const PLATFORM_RULE_PATHS = {
  cursor:   (cwd) => path.join(cwd, '.cursor', 'rules', 'caveman.mdc'),
  windsurf: (cwd) => path.join(cwd, '.windsurf', 'rules', 'caveman.md'),
  cline:    (cwd) => path.join(cwd, '.clinerules', 'caveman.md'),
  roo:      (cwd) => path.join(cwd, '.roo', 'rules', 'caveman.md'),
  opencode: (cwd) => path.join(cwd, '.opencode', 'rules', 'caveman.md'),
  copilot:  (cwd) => path.join(cwd, '.github', 'copilot-instructions.md'),
};

const FRONTMATTER = {
  cursor:   '---\nalwaysApply: true\n---\n\n',
  windsurf: '---\ntrigger: always_on\n---\n\n',
};

const COPILOT_START = '<!-- caveman:start -->';
const COPILOT_END   = '<!-- caveman:end -->';

// ─── Install ─────────────────────────────────────────────────────────────────

export function installCaveman(platform, cwd = process.cwd()) {
  if (platform === 'claude') {
    _installClaudeCode();
    return;
  }
  if (platform === 'generic' || platform === 'custom') {
    console.log('\nCaveman always-on snippet (paste into your agent system prompt):\n');
    console.log(RULE_BODY);
    return;
  }
  if (platform === 'copilot') {
    _installCopilot(cwd);
    return;
  }
  const rulePath = PLATFORM_RULE_PATHS[platform]?.(cwd);
  if (!rulePath) return;
  const frontmatter = FRONTMATTER[platform] ?? '';
  fs.mkdirSync(path.dirname(rulePath), { recursive: true });
  fs.writeFileSync(rulePath, frontmatter + RULE_BODY + '\n', 'utf-8');
}

function _installClaudeCode() {
  const hooksDir     = path.join(os.homedir(), '.claude', 'hooks');
  const rulesDir     = path.join(os.homedir(), '.claude', 'rules');
  const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
  const activateCmd  = `node ${path.join(hooksDir, 'caveman-activate.js')}`;
  const trackerCmd   = `node ${path.join(hooksDir, 'caveman-mode-tracker.js')}`;

  fs.mkdirSync(hooksDir, { recursive: true });
  fs.mkdirSync(rulesDir, { recursive: true });
  fs.writeFileSync(path.join(hooksDir, 'caveman-activate.js'),    HOOK_ACTIVATE, 'utf-8');
  fs.writeFileSync(path.join(hooksDir, 'caveman-mode-tracker.js'), HOOK_TRACKER,  'utf-8');
  fs.writeFileSync(path.join(rulesDir, 'caveman-activate.md'),     RULE_BODY + '\n', 'utf-8');

  let settings = {};
  try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8')); } catch {}
  settings.hooks ??= {};
  settings.hooks.SessionStart ??= [];
  settings.hooks.UserPromptSubmit ??= [];

  const hasCmd = (arr, cmd) => arr.some(h => (h?.hooks ?? []).some(e => e?.command === cmd));
  if (!hasCmd(settings.hooks.SessionStart, activateCmd))
    settings.hooks.SessionStart.push({ hooks: [{ type: 'command', command: activateCmd }] });
  if (!hasCmd(settings.hooks.UserPromptSubmit, trackerCmd))
    settings.hooks.UserPromptSubmit.push({ hooks: [{ type: 'command', command: trackerCmd }] });

  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
}

function _installCopilot(cwd) {
  const filePath = path.join(cwd, '.github', 'copilot-instructions.md');
  const block    = `\n${COPILOT_START}\n${RULE_BODY}\n${COPILOT_END}\n`;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf-8');
    if (existing.includes(COPILOT_START)) return; // idempotent — already installed
    fs.appendFileSync(filePath, block, 'utf-8');
  } else {
    fs.writeFileSync(filePath, block.trimStart(), 'utf-8');
  }
}

// ─── Uninstall ───────────────────────────────────────────────────────────────

export function uninstallCaveman(platform, cwd = process.cwd()) {
  if (platform === 'claude') {
    _uninstallClaudeCode();
    return;
  }
  if (platform === 'generic' || platform === 'custom') {
    console.log('Remove the caveman snippet from your agent system prompt manually.');
    return;
  }
  if (platform === 'copilot') {
    _uninstallCopilot(cwd);
    return;
  }
  const rulePath = PLATFORM_RULE_PATHS[platform]?.(cwd);
  if (rulePath) try { fs.unlinkSync(rulePath); } catch { /* already gone */ }
}

function _uninstallClaudeCode() {
  const hooksDir     = path.join(os.homedir(), '.claude', 'hooks');
  const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
  const flagFile     = path.join(os.homedir(), '.claude', '.caveman-active');
  const rulesFile    = path.join(os.homedir(), '.claude', 'rules', 'caveman-activate.md');
  const activateCmd  = `node ${path.join(hooksDir, 'caveman-activate.js')}`;
  const trackerCmd   = `node ${path.join(hooksDir, 'caveman-mode-tracker.js')}`;

  try { fs.unlinkSync(path.join(hooksDir, 'caveman-activate.js'));    } catch {}
  try { fs.unlinkSync(path.join(hooksDir, 'caveman-mode-tracker.js')); } catch {}
  try { fs.unlinkSync(flagFile);   } catch {}
  try { fs.unlinkSync(rulesFile);  } catch {}

  let settings = {};
  try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8')); } catch { return; }

  const removeCmd = (arr, cmd) =>
    (arr ?? [])
      .map(h => ({ ...h, hooks: (h.hooks ?? []).filter(e => e?.command !== cmd) }))
      .filter(h => h.hooks.length > 0);

  if (settings.hooks) {
    settings.hooks.SessionStart     = removeCmd(settings.hooks.SessionStart,     activateCmd);
    settings.hooks.UserPromptSubmit  = removeCmd(settings.hooks.UserPromptSubmit,  trackerCmd);
  }
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
}

function _uninstallCopilot(cwd) {
  const filePath = path.join(cwd, '.github', 'copilot-instructions.md');
  if (!fs.existsSync(filePath)) return; // no-op if file absent
  let content = fs.readFileSync(filePath, 'utf-8');
  const start = content.indexOf(COPILOT_START);
  const end   = content.indexOf(COPILOT_END);
  if (start === -1 || end === -1 || end < start) return;
  content = content.slice(0, start).trimEnd() + '\n' + content.slice(end + COPILOT_END.length).trimStart();
  fs.writeFileSync(filePath, content || '', 'utf-8');
}
