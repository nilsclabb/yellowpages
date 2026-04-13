#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs';
import { main } from '../src/index.js';
import { uninstallCaveman } from '../src/caveman.js';
import { detectPlatforms } from '../src/platforms.js';

// ── --uninstall caveman ──────────────────────────────────────────────────────
if (process.argv.includes('--uninstall') && process.argv.includes('caveman')) {
  const cwd = process.cwd();

  // Read platform from yellowpages.config.json if available
  let platform = null;
  try {
    const config = JSON.parse(fs.readFileSync(path.join(cwd, 'yellowpages.config.json'), 'utf-8'));
    if (config.platform) platform = config.platform;
  } catch {}

  // Fall back to auto-detection
  if (!platform) {
    const detected = detectPlatforms(cwd);
    platform = detected[0] ?? 'generic';
  }

  try {
    uninstallCaveman(platform, cwd);
    console.log(`Caveman uninstalled (platform: ${platform}).`);
  } catch (err) {
    console.error('Caveman uninstall failed:', err.message);
    process.exit(1);
  }
  process.exit(0);
}

// ── Normal install flow ──────────────────────────────────────────────────────
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
