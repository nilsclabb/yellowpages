#!/usr/bin/env bash
# uninstall.sh — Remove caveman hooks from Claude Code
# Removes hook files from ~/.claude/hooks/, cleans settings.json, deletes flag file
# Only reads/writes within ~/.claude/ — never modifies files elsewhere

set -euo pipefail

HOOKS_DIR="$HOME/.claude/hooks"
SETTINGS="$HOME/.claude/settings.json"
FLAG_FILE="$HOME/.claude/.caveman-active"

echo "Uninstalling caveman hooks..."

# Remove hook files (no-op if missing)
rm -f "$HOOKS_DIR/caveman-activate.js"
rm -f "$HOOKS_DIR/caveman-mode-tracker.js"
echo "  ✓ Hook files removed"

# Remove flag file
rm -f "$FLAG_FILE"
echo "  ✓ Flag file removed"

# Clean settings.json
if [ -f "$SETTINGS" ]; then
  node --input-type=module << 'NODEEOF'
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
const hooksDir    = path.join(os.homedir(), '.claude', 'hooks');
const activateCmd = `node ${path.join(hooksDir, 'caveman-activate.js')}`;
const trackerCmd  = `node ${path.join(hooksDir, 'caveman-mode-tracker.js')}`;

let settings = {};
try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8')); } catch { process.exit(0); }

const removeCmd = (arr, cmd) =>
  (arr ?? [])
    .map(h => ({ ...h, hooks: (h.hooks ?? []).filter(e => e?.command !== cmd) }))
    .filter(h => h.hooks.length > 0);

if (settings.hooks) {
  settings.hooks.SessionStart    = removeCmd(settings.hooks.SessionStart,    activateCmd);
  settings.hooks.UserPromptSubmit = removeCmd(settings.hooks.UserPromptSubmit, trackerCmd);
}

fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
console.log('  ✓ ~/.claude/settings.json cleaned');
NODEEOF
fi

echo ""
echo "Caveman uninstalled."
