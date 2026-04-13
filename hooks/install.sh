#!/usr/bin/env bash
# install.sh — Wire caveman hooks into Claude Code
# Copies hook files to ~/.claude/hooks/ and patches ~/.claude/settings.json
# Only reads/writes within ~/.claude/ — never modifies files elsewhere
#
# Credit: hook architecture by Julius Brussee
# https://github.com/JuliusBrussee/caveman

set -euo pipefail

HOOKS_DIR="$HOME/.claude/hooks"
SETTINGS="$HOME/.claude/settings.json"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing caveman hooks for Claude Code..."

# Create hooks dir and copy files
mkdir -p "$HOOKS_DIR"
cp "$SCRIPT_DIR/caveman-activate.js" "$HOOKS_DIR/caveman-activate.js"
cp "$SCRIPT_DIR/caveman-mode-tracker.js" "$HOOKS_DIR/caveman-mode-tracker.js"
echo "  ✓ Hook files copied to $HOOKS_DIR"

# Ensure settings.json exists
mkdir -p "$(dirname "$SETTINGS")"
[ -f "$SETTINGS" ] || echo "{}" > "$SETTINGS"

# Patch settings.json via Node (handles JSON safely)
node --input-type=module << 'NODEEOF'
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
const hooksDir    = path.join(os.homedir(), '.claude', 'hooks');
const activateCmd = `node ${path.join(hooksDir, 'caveman-activate.js')}`;
const trackerCmd  = `node ${path.join(hooksDir, 'caveman-mode-tracker.js')}`;

let settings = {};
try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8')); } catch {}

settings.hooks ??= {};
settings.hooks.SessionStart ??= [];
settings.hooks.UserPromptSubmit ??= [];

const hasCmd = (arr, cmd) =>
  arr.some(h => (h?.hooks ?? []).some(e => e?.command === cmd));

if (!hasCmd(settings.hooks.SessionStart, activateCmd)) {
  settings.hooks.SessionStart.push({ hooks: [{ type: 'command', command: activateCmd }] });
}
if (!hasCmd(settings.hooks.UserPromptSubmit, trackerCmd)) {
  settings.hooks.UserPromptSubmit.push({ hooks: [{ type: 'command', command: trackerCmd }] });
}

fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
console.log('  ✓ ~/.claude/settings.json patched');
NODEEOF

echo ""
echo "Caveman installed. Active from your next Claude Code session."
echo "Toggle: /caveman | /caveman lite | /caveman ultra | stop caveman"
