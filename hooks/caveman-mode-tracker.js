#!/usr/bin/env node
/**
 * caveman-mode-tracker.js — UserPromptSubmit hook
 *
 * Reads incoming prompt JSON from stdin. Updates ~/.claude/.caveman-active
 * flag file when /caveman commands are detected.
 *
 * CRITICAL CONSTRAINTS:
 *   - Always exits 0. Non-zero would block prompt submission.
 *   - Never writes to stdout. UserPromptSubmit stdout modifies the user's prompt.
 *   - Silent-fail on all errors.
 *
 * Credit: mode tracking pattern by Julius Brussee
 * https://github.com/JuliusBrussee/caveman
 */

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

    if (prompt.startsWith('/caveman ultra')) {
      fs.writeFileSync(FLAG_FILE, 'ultra', 'utf-8');
    } else if (prompt.startsWith('/caveman lite')) {
      fs.writeFileSync(FLAG_FILE, 'lite', 'utf-8');
    } else if (prompt.startsWith('/caveman')) {
      fs.writeFileSync(FLAG_FILE, 'full', 'utf-8');
    } else if (prompt.includes('stop caveman') || prompt.includes('normal mode')) {
      try { fs.unlinkSync(FLAG_FILE); } catch { /* already gone — fine */ }
    }
  } catch {
    // Silent fail
  }
  process.exit(0); // Always 0
}

main();
