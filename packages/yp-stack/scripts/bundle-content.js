#!/usr/bin/env node

/**
 * Bundle skills, governance, and hooks into generated JS modules.
 *
 * Outputs:
 *   src/content.js  — FILES map (skills + governance content)
 *   src/hooks.js    — Hook constants read from hooks/ source files + version
 *
 * Single source of truth:
 *   Skills:     skills/yellowpages/
 *   Governance: .agents/ (excluding .agents/skills/)
 *   Hooks:      hooks/ (caveman-activate.js, caveman-mode-tracker.js, skills-manifest.js)
 *   Version:    packages/yp-stack/package.json
 *
 * Run: node scripts/bundle-content.js
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..", "..", "..");
const skillsDir = path.resolve(repoRoot, "skills");
const agentsDir = path.resolve(repoRoot, ".agents");
const hooksDir = path.resolve(repoRoot, "hooks");
const contentOut = path.resolve(__dirname, "..", "src", "content.js");
const hooksOut = path.resolve(__dirname, "..", "src", "hooks.js");

const _require = createRequire(import.meta.url);
const { version } = _require("../package.json");

function walk(dir, base) {
  const entries = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(base, entry.name);
    if (entry.isDirectory()) {
      entries.push(...walk(fullPath, relPath));
    } else if (entry.isFile()) {
      entries.push({ relPath, fullPath });
    }
  }
  return entries;
}

// ── 1. Bundle content (skills + governance) ─────────────────────────────────

const manifest = {};

if (fs.existsSync(skillsDir)) {
  const skillFiles = walk(skillsDir, "skills");
  for (const { relPath, fullPath } of skillFiles) {
    const content = fs.readFileSync(fullPath, "utf-8");
    manifest[relPath.split(path.sep).join("/")] = content;
  }
  console.log(`  Skills: ${skillFiles.length} files from skills/`);
} else {
  console.error(`Error: skills/ directory not found at ${skillsDir}`);
  process.exit(1);
}

if (fs.existsSync(agentsDir)) {
  let govCount = 0;
  for (const { relPath, fullPath } of walk(agentsDir, "")) {
    const key = relPath.split(path.sep).join("/");
    if (key.startsWith("skills/")) continue;
    manifest[key] = fs.readFileSync(fullPath, "utf-8");
    govCount++;
  }
  console.log(`  Governance: ${govCount} files from .agents/`);
} else {
  console.warn(`Warning: .agents/ not found — skipping governance`);
}

fs.writeFileSync(
  contentOut,
  `// Auto-generated — run: npm run bundle\n\nexport const FILES = ${JSON.stringify(manifest, null, 2)};\n`,
);
console.log(`  Content: ${Object.keys(manifest).length} files → src/content.js`);

// ── 2. Bundle hooks (read source → generate constants) ──────────────────────

function readHook(name) {
  const p = path.join(hooksDir, name);
  if (!fs.existsSync(p)) {
    console.error(`Error: hook source not found: ${p}`);
    process.exit(1);
  }
  return fs.readFileSync(p, "utf-8");
}

// Inject version into manifest hook (replaces `const BUNDLED_VERSION = null;`)
const manifestHook = readHook("skills-manifest.js").replace(
  "const BUNDLED_VERSION = null;",
  `const BUNDLED_VERSION = ${JSON.stringify(version)};`,
);
const cavemanActivate = readHook("caveman-activate.js");
const cavemanTracker = readHook("caveman-mode-tracker.js");

const hooksModule = `// Auto-generated from hooks/ source files — run: npm run bundle
// Single source of truth: edit hooks/*.js, then re-bundle.

export const VERSION = ${JSON.stringify(version)};

export const MANIFEST_HOOK = ${JSON.stringify(manifestHook)};

export const CAVEMAN_ACTIVATE_HOOK = ${JSON.stringify(cavemanActivate)};

export const CAVEMAN_TRACKER_HOOK = ${JSON.stringify(cavemanTracker)};
`;

fs.writeFileSync(hooksOut, hooksModule);
console.log(`  Hooks: 3 files → src/hooks.js (v${version})`);

console.log(`\nDone.`);
