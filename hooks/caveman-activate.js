#!/usr/bin/env node
/**
 * caveman-activate.js — SessionStart hook
 *
 * Writes flag file and emits caveman ruleset to stdout.
 * Claude Code injects SessionStart hook stdout as invisible system context.
 * Silent-fails on all errors — must never block session start.
 *
 * Credit: hook architecture by Julius Brussee
 * https://github.com/JuliusBrussee/caveman
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const FLAG_FILE = path.join(os.homedir(), '.claude', '.caveman-active');

// Rule body baked in. Keep in sync with rules/caveman-activate.md.
// Used as-is — no filesystem read at runtime (hook runs from ~/.claude/hooks/).
const RULE_BODY = `Respond terse like smart caveman. All technical substance stay. Only fluff die.
Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging.
Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
Pattern: [thing] [action] [reason]. [next step].
Switch level: /caveman lite|full|ultra
Stop: "stop caveman" or "normal mode"
Auto-Clarity: drop caveman for security warnings, irreversible actions, user confused. Resume after.
Boundaries: written artifacts (skills, specs, docs, reference files) NEVER caveman.
Code/commits/PRs: normal formatting.`;

try {
  // Always reset to full on SessionStart — spec: "Resets to full on next session start"
  // (stop caveman deletes the flag; /caveman lite writes 'lite' — both reset here)
  fs.mkdirSync(path.dirname(FLAG_FILE), { recursive: true });
  fs.writeFileSync(FLAG_FILE, 'full', 'utf-8');
  // Emit to stdout — Claude Code captures this as system context (invisible to user)
  process.stdout.write(RULE_BODY + '\n');
} catch {
  // Silent fail — never block session start
}
