# NPX Installer Animations Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add fun, polished ASCII animation experience (splash, per-file spinner, celebratory outro) to the `yp-stack` npx installer with graceful TTY/CI degradation.

**Architecture:** New `src/tty.js` exports `isInteractive` detection. New `src/animations.js` holds all primitives (`typewriter`, `fillBar`, `revealLines`, `customSpinner`) and sequences (`splash`, `celebration`). `install.js` gains optional `onFile` callback. `index.js` swaps intro/install/outro call sites.

**Tech Stack:** Node.js ≥ 18, ESM, `@clack/prompts`, `picocolors`, `figlet` (new), `gradient-string` (new)

**Spec:** `docs/specs/2026-04-13-npx-installer-animations-design.md`

**Working directory note:** All `git` commands are run from the repo root. All `node` smoke-tests are run from `packages/yp-stack/` unless noted. Before starting, set a shell variable for convenience:

```bash
REPO=$(git rev-parse --show-toplevel)
# e.g. /Users/you/codewithnils/yellowpages
```

Use `$REPO` anywhere the plan shows `$REPO`.

---

## Chunk 1: Foundation — deps, tty.js, animation primitives

### Task 1: Install dependencies

**Files:**
- Modify: `packages/yp-stack/package.json`

- [ ] **Step 1: Install figlet and gradient-string**

```bash
cd packages/yp-stack
npm install figlet gradient-string
```

Expected: Both packages appear in `node_modules/`. `package.json` now has `"figlet"` and `"gradient-string"` in `dependencies`.

- [ ] **Step 2: Verify ESM interop works**

From `packages/yp-stack/`:

```bash
node --input-type=module <<'EOF'
import figlet from 'figlet';
import gradient from 'gradient-string';
const text = figlet.textSync('test', { font: 'Small' });
console.log(gradient.atlas(text));
console.log('OK');
EOF
```

Expected: Prints colored ASCII art and "OK". If import fails, check `node --version` (must be ≥ 18).

- [ ] **Step 3: Verify required fonts and gradient presets are available**

```bash
node --input-type=module <<'EOF'
import figlet from 'figlet';
import gradient from 'gradient-string';
const fonts = figlet.fontsSync();
console.log('ANSI Shadow:', fonts.includes('ANSI Shadow'));
console.log('Small:', fonts.includes('Small'));
console.log('atlas preset:', typeof gradient.atlas === 'function');
EOF
```

Expected: All three lines print `true`.

- [ ] **Step 4: Commit**

From repo root:

```bash
cd $REPO
git add packages/yp-stack/package.json packages/yp-stack/package-lock.json
git commit -m "feat(yp-stack): add figlet and gradient-string deps"
```

---

### Task 2: Create src/tty.js

**Files:**
- Create: `packages/yp-stack/src/tty.js`

- [ ] **Step 1: Create the file**

```js
// packages/yp-stack/src/tty.js
/**
 * TTY and CI detection.
 * isInteractive is true only when running in a real interactive terminal.
 * Respects: CI env var, dumb terminals, NO_COLOR convention (no-color.org).
 */
export const isInteractive =
  Boolean(process.stdout.isTTY) &&
  !process.env.CI &&
  process.env.TERM !== 'dumb' &&
  !process.env.NO_COLOR;
```

- [ ] **Step 2: Smoke-test in TTY context**

From `packages/yp-stack/`:

```bash
node --input-type=module <<'EOF'
import { isInteractive } from './src/tty.js';
console.log('isInteractive:', isInteractive);
EOF
```

Expected: `isInteractive: true` (you're in a TTY).

- [ ] **Step 3: Smoke-test non-TTY (piped)**

```bash
node --input-type=module <<'EOF'
import { isInteractive } from './src/tty.js';
console.log('isInteractive:', isInteractive);
EOF | cat
```

Expected: `isInteractive: false`.

- [ ] **Step 4: Smoke-test CI env**

```bash
CI=1 node --input-type=module <<'EOF'
import { isInteractive } from './src/tty.js';
console.log('isInteractive:', isInteractive);
EOF
```

Expected: `isInteractive: false`.

- [ ] **Step 5: Commit**

From repo root:

```bash
git add packages/yp-stack/src/tty.js
git commit -m "feat(yp-stack): add tty.js TTY/CI detection"
```

---

### Task 3: Create src/animations.js — primitives

**Files:**
- Create: `packages/yp-stack/src/animations.js`

This task creates the primitives only. `splash()` and `celebration()` are added in Task 4.

- [ ] **Step 1: Create animations.js**

```js
// packages/yp-stack/src/animations.js
import * as p from '@clack/prompts';
import pc from 'picocolors';
import figlet from 'figlet';
import gradient from 'gradient-string';
import { createRequire } from 'module';

// ── Cursor restore on Ctrl+C ────────────────────────────────────────────────
process.on('SIGINT', () => {
  process.stdout.write('\x1B[?25h');
  process.exit(130);
});

// ── Helpers ─────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const HIDE_CURSOR = '\x1B[?25l';
const SHOW_CURSOR = '\x1B[?25h';
const CLEAR_LINE  = '\x1B[2K\r';

// ── typewriter ───────────────────────────────────────────────────────────────

/**
 * Print text character by character with a blinking cursor.
 * Hides cursor on start, restores on finish.
 */
export async function typewriter(text, delayMs = 30) {
  process.stdout.write(HIDE_CURSOR);
  for (const char of text) {
    process.stdout.write(char);
    await sleep(delayMs);
  }
  // Blink cursor briefly then remove it
  process.stdout.write(pc.dim('|'));
  await sleep(180);
  process.stdout.write('\b \b');
  process.stdout.write(SHOW_CURSOR);
  process.stdout.write('\n');
}

// ── fillBar ──────────────────────────────────────────────────────────────────

/**
 * Animate a fill bar left-to-right in ~durationMs.
 * Colors: cyan at start, green at end. Clears the bar line when done.
 */
export async function fillBar(widthChars = 20, durationMs = 600) {
  process.stdout.write(HIDE_CURSOR);
  const stepMs = durationMs / widthChars;
  let filled = 0;
  while (filled <= widthChars) {
    const ratio = filled / widthChars;
    const bar = '▓'.repeat(filled) + '░'.repeat(widthChars - filled);
    const colored = ratio < 0.5 ? pc.cyan(bar) : pc.green(bar);
    const pct = Math.round(ratio * 100);
    process.stdout.write(CLEAR_LINE + '  ' + colored + '  ' + pc.dim(pct + '%'));
    filled++;
    if (filled <= widthChars) await sleep(stepMs);
  }
  await sleep(120);
  process.stdout.write(CLEAR_LINE);
  process.stdout.write(SHOW_CURSOR);
}

// ── revealLines ──────────────────────────────────────────────────────────────

/**
 * Print an array of strings with per-line delay.
 * Hides cursor during reveal, restores after.
 */
export async function revealLines(lines, delayMs = 40) {
  process.stdout.write(HIDE_CURSOR);
  for (const line of lines) {
    process.stdout.write(line + '\n');
    await sleep(delayMs);
  }
  process.stdout.write(SHOW_CURSOR);
}

// ── customSpinner ────────────────────────────────────────────────────────────

/**
 * Create a spinner using custom frame arrays.
 *
 * Returns:
 *   spinner.start(label)   — hide cursor, begin frame loop on current line
 *   spinner.update(label)  — swap label text, continue frames
 *   spinner.stop(finalMsg) — halt loop, clear line, print finalMsg (optional), restore cursor
 *   spinner.pause()        — halt interval, clear current spinner line (for file output interleaving)
 *   spinner.resume()       — restart interval on current line position
 *
 * finalMsg in stop() is optional — omit or pass '' to clear with no output.
 */
export function customSpinner(frames = ['◐', '◓', '◑', '◒'], intervalMs = 80) {
  let timer = null;
  let frameIdx = 0;
  let currentLabel = '';

  function render() {
    const frame = pc.cyan(frames[frameIdx % frames.length]);
    process.stdout.write(CLEAR_LINE + '  ' + frame + '  ' + currentLabel);
    frameIdx++;
  }

  return {
    start(label = '') {
      currentLabel = label;
      frameIdx = 0;
      process.stdout.write(HIDE_CURSOR);
      render();
      timer = setInterval(render, intervalMs);
    },
    update(label) {
      currentLabel = label;
    },
    pause() {
      if (timer) { clearInterval(timer); timer = null; }
      process.stdout.write(CLEAR_LINE);
    },
    resume() {
      render();
      timer = setInterval(render, intervalMs);
    },
    stop(finalMsg = '') {
      if (timer) { clearInterval(timer); timer = null; }
      process.stdout.write(CLEAR_LINE);
      if (finalMsg) process.stdout.write(finalMsg + '\n');
      process.stdout.write(SHOW_CURSOR);
    },
  };
}

// splash() and celebration() added in Task 4
```

- [ ] **Step 2: Smoke-test typewriter**

From `packages/yp-stack/`:

```bash
node --input-type=module <<'EOF'
import { typewriter } from './src/animations.js';
await typewriter('Hello, world!', 40);
EOF
```

Expected: Characters print one by one, blinking cursor appears then disappears.

- [ ] **Step 3: Smoke-test fillBar**

```bash
node --input-type=module <<'EOF'
import { fillBar } from './src/animations.js';
process.stdout.write('  ⚡ Loading...\n');
await fillBar(20, 800);
process.stdout.write('Done\n');
EOF
```

Expected: Bar fills cyan→green, clears itself, "Done" prints on a clean line.

- [ ] **Step 4: Smoke-test revealLines**

```bash
node --input-type=module <<'EOF'
import { revealLines } from './src/animations.js';
await revealLines(['line one', 'line two', 'line three'], 80);
console.log('finished');
EOF
```

Expected: Three lines appear with ~80ms delay between each, then "finished" prints.

- [ ] **Step 5: Smoke-test customSpinner with pause/resume**

```bash
node --input-type=module <<'EOF'
import { customSpinner } from './src/animations.js';
const s = customSpinner(['◐','◓','◑','◒'], 80);
s.start('Installing...');
await new Promise(r => setTimeout(r, 400));
s.pause();
process.stdout.write('  + some/file.md\n');
s.resume();
await new Promise(r => setTimeout(r, 400));
s.pause();
process.stdout.write('  + another/file.md\n');
s.resume();
await new Promise(r => setTimeout(r, 200));
s.stop('✔ Done');
EOF
```

Expected: Spinner cycles, pauses for each file line (no visual conflict), stops cleanly with "✔ Done".

- [ ] **Step 6: Commit**

From repo root:

```bash
git add packages/yp-stack/src/animations.js
git commit -m "feat(yp-stack): add animation primitives (typewriter, fillBar, revealLines, customSpinner)"
```

---

## Chunk 2: Sequences — splash, celebration, install.js onFile

### Task 4: Add splash() and celebration() to animations.js

**Files:**
- Modify: `packages/yp-stack/src/animations.js`

- [ ] **Step 1: Add VERSION and sequences at bottom of animations.js**

Append the following to the end of `packages/yp-stack/src/animations.js` (replacing the `// splash() and celebration() added in Task 4` comment):

```js
// ── VERSION ──────────────────────────────────────────────────────────────────
const _require = createRequire(import.meta.url);
const { version: VERSION } = _require('../package.json');

// ── splash ───────────────────────────────────────────────────────────────────

/**
 * Full opening sequence: clear, ASCII art header, typewriter tagline, version badge.
 * Non-TTY: prints plain version line only.
 *
 * @param {boolean} isInteractive
 */
export async function splash(isInteractive) {
  if (!isInteractive) {
    console.log(`yp-stack v${VERSION}`);
    return;
  }

  // Soft clear (preserve scrollback)
  process.stdout.write('\x1B[2J\x1B[H');
  await sleep(80);

  // ASCII art header
  process.stdout.write(HIDE_CURSOR);
  const ascii = figlet.textSync('yp-stack', { font: 'ANSI Shadow' });
  const yellowToOrange = gradient(['#f9d71c', '#ff8c00', '#ff6b00']);
  console.log(yellowToOrange(ascii));

  // Tagline typewriter
  process.stdout.write('  ');
  await typewriter(pc.bold('Agent skills & workflows, installed.'), 28);

  // Version + divider
  console.log('  ' + pc.dim(`v${VERSION} · npx yp-stack`));
  console.log('  ' + pc.dim('─'.repeat(50)));
  console.log();

  process.stdout.write(SHOW_CURSOR);
}

// ── celebration ──────────────────────────────────────────────────────────────

/**
 * Full outro sequence: DONE ASCII art, next-steps note, sign-off.
 * Non-TTY: prints plain next-steps list and done message.
 *
 * @param {string[]} nextSteps  Array of formatted strings for the note body
 * @param {boolean} isInteractive
 */
export async function celebration(nextSteps, isInteractive) {
  if (!isInteractive) {
    console.log('\nNext steps:');
    for (const step of nextSteps) {
      console.log('  ' + step);
    }
    console.log('\nDone! Yellowpages is ready.');
    return;
  }

  console.log();

  // Beat 1: DONE ASCII art, line-by-line reveal
  const doneAscii = figlet.textSync('DONE!', { font: 'Small' });
  const greenTeal = gradient(['#00b09b', '#96c93d']);
  const doneLines = greenTeal(doneAscii).split('\n');
  await revealLines(doneLines, 40);

  console.log();

  // Beat 2: Next steps note box (uses @clack for consistent styling)
  p.note(nextSteps.join('\n'), "What's next?");

  console.log();

  // Beat 3: Sign-off
  process.stdout.write(
    '  ' + pc.bold(pc.yellow('◆')) + '  ' +
    gradient.atlas('Yellowpages is ready. Go build something great.') + '\n'
  );
  console.log();
}
```

- [ ] **Step 2: Smoke-test splash() in interactive mode**

From `packages/yp-stack/`:

```bash
node --input-type=module <<'EOF'
import { splash } from './src/animations.js';
await splash(true);
console.log('[prompts would start here]');
EOF
```

Expected: Screen clears, large yellow→orange "yp-stack" ASCII art, tagline types out, version badge, divider. Cursor restored before `[prompts would start here]` prints.

- [ ] **Step 3: Smoke-test splash() in non-interactive mode (no escape codes)**

```bash
node --input-type=module <<'EOF'
import { splash } from './src/animations.js';
await splash(false);
EOF | cat -v
```

Expected: Only `yp-stack v0.1.1` (or current version). No `^[` escape code sequences in output.

- [ ] **Step 4: Smoke-test celebration()**

```bash
node --input-type=module <<'EOF'
import pc from 'picocolors';
import { celebration } from './src/animations.js';
const steps = [
  '📖  Read   ' + pc.cyan('skills/yellowpages/SKILL.md'),
  '🤖  Open   ' + pc.cyan('your agent platform'),
  '⚡  Run    ' + pc.yellow('/yellowpages to get started'),
];
await celebration(steps, true);
EOF
```

Expected: "DONE!" ASCII art fades in (green→teal), clack note box with next steps, gradient sign-off line.

- [ ] **Step 5: Commit**

From repo root:

```bash
git add packages/yp-stack/src/animations.js
git commit -m "feat(yp-stack): add splash and celebration sequences to animations.js"
```

---

### Task 5: Modify install.js — add onFile callback

**Files:**
- Modify: `packages/yp-stack/src/install.js`

- [ ] **Step 1: Add onFile parameter to installFiles()**

In `packages/yp-stack/src/install.js`, replace the JSDoc block and function export (everything from the `/**` before `export function installFiles` through the closing `}`) with:

```js
/**
 * Install yellowpages files.
 *
 * @param {Object} options
 * @param {string} options.skillPathAbsolute   Absolute path to skills dir (e.g. /Users/x/.claude/skills)
 * @param {string} options.governancePath      Absolute path to .agents dir
 * @param {'full'|'skill'|'minimal'} options.scope
 * @param {'new'|'existing'|'monorepo'} options.projectType
 * @param {boolean} options.stateTracking
 * @param {((absPath: string, status: 'created'|'skipped') => void) | null} [onFile]
 *   Called immediately after each file write with the absolute path and status.
 *   Callers should apply displayPath() before rendering to terminal.
 *   Does NOT fire for learnings.jsonl (handled separately after the main loops).
 * @returns {{ created: string[], skipped: string[] }}
 */
export function installFiles(
  { skillPathAbsolute, governancePath, scope, projectType, stateTracking },
  onFile = null,
) {
  const nonDestructive = projectType === 'existing' || projectType === 'monorepo';
  const { skillKeys, governanceKeys } = resolveFileList(scope, stateTracking);

  const created = [];
  const skipped = [];

  // Skill files → <skillPathAbsolute>/yellowpages/...
  for (const key of skillKeys) {
    const tail = key.slice(SKILL_PREFIX.length);
    const dest = path.join(skillPathAbsolute, 'yellowpages', tail);
    const status = safeWrite(dest, FILES[key], nonDestructive);
    (status === 'created' ? created : skipped).push(dest);
    if (onFile) onFile(dest, status);
  }

  // Governance files → <governancePath>/...
  for (const key of governanceKeys) {
    const dest = path.join(governancePath, key);
    const status = safeWrite(dest, FILES[key], nonDestructive);
    (status === 'created' ? created : skipped).push(dest);
    if (onFile) onFile(dest, status);
  }

  // Create empty learnings.jsonl if state tracking enabled.
  // Does NOT call onFile — appears in Act 3 count summary only.
  if (stateTracking) {
    const learningsPath = path.join(governancePath, 'state', 'learnings.jsonl');
    if (!fs.existsSync(learningsPath)) {
      fs.mkdirSync(path.dirname(learningsPath), { recursive: true });
      fs.writeFileSync(learningsPath, '', 'utf-8');
      created.push(learningsPath);
    } else {
      skipped.push(learningsPath);
    }
  }

  return { created, skipped };
}
```

- [ ] **Step 2: Verify the export is callable without onFile**

From `packages/yp-stack/`:

```bash
node --input-type=module <<'EOF'
import { installFiles } from './src/install.js';
console.log(typeof installFiles);
EOF
```

Expected: `function`.

- [ ] **Step 3: Verify onFile fires with absolute paths for main loops**

```bash
node --input-type=module <<'EOF'
import path from 'path';
import os from 'os';
import fs from 'fs';
import { installFiles } from './src/install.js';

const tmpDir = os.tmpdir();
const skillsDir = path.join(tmpDir, 'yp-test-skills');
const agentsDir = path.join(tmpDir, 'yp-test-agents');
const calls = [];

installFiles(
  {
    skillPathAbsolute: skillsDir,
    governancePath: agentsDir,
    scope: 'minimal',
    projectType: 'new',
    stateTracking: false,
  },
  (absPath, status) => calls.push({ absPath, status })
);

console.log('onFile calls:', calls.length);
console.log('all absolute:', calls.every(c => path.isAbsolute(c.absPath)));
console.log('sample:', calls[0]);

fs.rmSync(skillsDir, { recursive: true, force: true });
fs.rmSync(agentsDir, { recursive: true, force: true });
EOF
```

Expected: `onFile calls` > 0, `all absolute: true`, sample shows a real absolute path.

- [ ] **Step 4: Verify onFile does NOT fire for learnings.jsonl**

```bash
node --input-type=module <<'EOF'
import path from 'path';
import os from 'os';
import fs from 'fs';
import { installFiles } from './src/install.js';

const tmpDir = os.tmpdir();
const skillsDir = path.join(tmpDir, 'yp-test2-skills');
const agentsDir = path.join(tmpDir, 'yp-test2-agents');
const calls = [];

installFiles(
  {
    skillPathAbsolute: skillsDir,
    governancePath: agentsDir,
    scope: 'minimal',
    projectType: 'new',
    stateTracking: true,
  },
  (absPath, status) => calls.push(absPath)
);

const hasLearnings = calls.some(p => p.includes('learnings.jsonl'));
console.log('learnings.jsonl in onFile calls:', hasLearnings);
console.log('Expected: false');

fs.rmSync(skillsDir, { recursive: true, force: true });
fs.rmSync(agentsDir, { recursive: true, force: true });
EOF
```

Expected: `learnings.jsonl in onFile calls: false`.

- [ ] **Step 5: Commit**

From repo root:

```bash
git add packages/yp-stack/src/install.js
git commit -m "feat(yp-stack): add optional onFile callback to installFiles()"
```

---

## Chunk 3: index.js integration

### Task 6: Update index.js — VERSION, splash, color touches, install animation, celebration

**Files:**
- Modify: `packages/yp-stack/src/index.js`

**Important:** Apply these steps in order — each step depends on the previous.

- [ ] **Step 1: Replace imports and VERSION constant at top of index.js**

Replace this block at the very top of `packages/yp-stack/src/index.js`:

```js
import * as p from "@clack/prompts";
import pc from "picocolors";
import os from "node:os";
import path from "node:path";
import { PLATFORMS, detectPlatforms, getPlatform } from "./platforms.js";
import { installFiles, writeConfig, appendToInstructions } from "./install.js";
import { installCaveman } from "./caveman.js";

const VERSION = "0.1.0";
```

With:

```js
import * as p from "@clack/prompts";
import pc from "picocolors";
import os from "node:os";
import path from "node:path";
import { createRequire } from "module";
import { PLATFORMS, detectPlatforms, getPlatform } from "./platforms.js";
import { installFiles, writeConfig, appendToInstructions } from "./install.js";
import { installCaveman } from "./caveman.js";
import { isInteractive } from "./tty.js";
import { splash, fillBar, customSpinner, celebration } from "./animations.js";

const _require = createRequire(import.meta.url);
const { version: VERSION } = _require("../package.json");
```

- [ ] **Step 2: Replace p.intro() block with splash()**

Find and replace this block (near the start of `main()`):

```js
  console.log();
  p.intro(pc.bgCyan(pc.black(" yp-stack ")));

  console.log();
  console.log(`  ${pc.dim("The yellowpages skill system for AI agents")}`);
  console.log(`  ${pc.dim("Target:")} ${pc.cyan(cwd)}`);
  console.log();
```

With:

```js
  await splash(isInteractive);

  if (isInteractive) {
    console.log(`  ${pc.dim("Target:")} ${pc.cyan(cwd)}`);
    console.log();
  }
```

- [ ] **Step 3: Add color to step counter q() and platform labels**

Find:

```js
  function q(msg) {
    step++;
    return `${pc.dim(`[${step} of ${totalSteps}]`)} ${msg}`;
  }
```

Replace with:

```js
  function q(msg) {
    step++;
    return `${pc.yellow(`[${step} of ${totalSteps}]`)} ${msg}`;
  }
```

Find the platform options mapping:

```js
    options: PLATFORMS.map((pl) => ({
      value: pl.value,
      label: pl.name,
      hint: pl.skillPath
        ? `${pl.skillPath}/${detected.includes(pl.value) ? pc.green(" detected") : ""}`
        : "enter path",
    })),
```

Replace with:

```js
    options: PLATFORMS.map((pl) => ({
      value: pl.value,
      label: detected.includes(pl.value) ? pc.cyan(pl.name) : pl.name,
      hint: pl.skillPath
        ? `${pl.skillPath}/${detected.includes(pl.value) ? pc.green("✓ detected") : ""}`
        : "enter path",
    })),
```

- [ ] **Step 4: Hoist displayBase, prefix, and displayPath above the install block**

The current code has `displayBase`, `prefix`, and `displayPath` defined inside the results section (after `spinner.stop()`). They must be moved before the install block so `onFile` can use them.

Find the results section block that currently defines them:

```js
    // Results — show paths relative to home (global) or cwd (project)
    const displayBase = isGlobal ? os.homedir() : cwd;
    const prefix = isGlobal ? "~/" : "";

    function displayPath(absPath) {
      if (absPath.startsWith("/") || absPath.startsWith("\\")) {
        return prefix + path.relative(displayBase, absPath);
      }
      return absPath;
    }

    const lines = [];
    for (const f of result.created) {
      lines.push(`${pc.green("+")} ${displayPath(f)}`);
    }
    for (const f of result.skipped) {
      lines.push(`${pc.yellow("~")} ${displayPath(f)} ${pc.dim("(exists, skipped)")}`);
    }

    if (lines.length > 0) {
      console.log();
      p.note(
        lines.join("\n"),
        `${result.created.length} created, ${result.skipped.length} skipped`,
      );
    }

    console.log();
    p.outro(pc.green("Done! Yellowpages is ready."));
```

Replace this entire block with just a comment placeholder (the actual celebration call comes in Step 6):

```js
    // <<CELEBRATION_PLACEHOLDER>>
```

Then, find the line that defines `rootDir` and the block that resolves paths (ending around `const governanceDisplay = ...`). Insert the following immediately after `const governanceDisplay = ...`:

```js
  // Path display helpers — hoisted here so onFile callback can use them
  const displayBase = isGlobal ? os.homedir() : cwd;
  const prefix = isGlobal ? "~/" : "";

  function displayPath(absPath) {
    if (absPath.startsWith("/") || absPath.startsWith("\\")) {
      return prefix + path.relative(displayBase, absPath);
    }
    return absPath;
  }
```

- [ ] **Step 5: Replace the install spinner block with 3-act animation**

Find and replace the current install block. In the original `index.js`, the block looks like:

```js
  const spinner = p.spinner();
  spinner.start(`Installing yellowpages v${VERSION}`);

  try {
    const result = installFiles({ ... });
    ...
    spinner.stop("Installation complete");
```

Replace everything from `const spinner = p.spinner();` through `spinner.stop("Installation complete");` (inclusive) — this range includes the original `try {` opener, which the replacement re-introduces as `let spinner = null; ... try {`. No brace mismatch results. The replacement block ends before the caveman section (`// ── Caveman terse mode ──`), which stays inside the try and is left intact.

The replacement is:

```js
  // ── Install animation ────────────────────────────────────────────────────

  let spinner = null;

  try {
    if (isInteractive) {
      // Act 1: theatrical pre-install bar
      console.log();
      process.stdout.write("  " + pc.cyan("⚡ Preparing yellowpages v" + VERSION + "...") + "\n");
      await fillBar(20, 600);
      console.log();

      // Act 2: per-file spinner
      spinner = customSpinner(["◐", "◓", "◑", "◒"], 80);
      spinner.start(pc.dim("Installing skills..."));
    }

    function onFile(absPath, status) {
      if (!isInteractive || !spinner) return;
      // Determine next label before pausing
      const inGovernance = absPath.startsWith(governancePath);
      const nextLabel = pc.dim(inGovernance ? "Installing governance..." : "Installing skills...");
      // pause → write → update label → resume (order matters: update before resume)
      spinner.pause();
      const rel = displayPath(absPath);
      if (status === "created") {
        process.stdout.write("  " + pc.green("+") + " " + pc.cyan(rel) + "\n");
      } else {
        process.stdout.write("  " + pc.yellow("~") + " " + pc.dim(rel) + pc.dim(" (exists, skipped)") + "\n");
      }
      spinner.update(nextLabel);
      spinner.resume();
    }

    const result = installFiles(
      {
        skillPathAbsolute,
        governancePath,
        scope,
        projectType: isGlobal ? "new" : projectType,
        stateTracking,
      },
      onFile,
    );

    if (createConfig) {
      const configDir = isGlobal ? os.homedir() : rootDir;
      writeConfig(configDir, {
        version: VERSION,
        platform,
        installLocation,
        skillPath: path.relative(configDir, skillPathAbsolute),
        scope,
        projectType: isGlobal ? "global" : projectType,
        stateTracking,
        integrationStyle,
        installedAt: new Date().toISOString(),
      });
      result.created.push("yellowpages.config.json");
    }

    if (integrationStyle === "project-instructions" && !isGlobal) {
      appendToInstructions(rootDir, "CLAUDE.md");
      result.created.push("CLAUDE.md (appended)");
    }

    // Act 3: completion burst
    if (isInteractive && spinner) {
      spinner.stop();
      console.log();
      process.stdout.write(
        "  " + pc.bold(pc.green("✔")) + "  " +
        pc.bold(pc.green(result.created.length + " files installed")) +
        pc.dim(" · ") +
        pc.yellow(result.skipped.length + " skipped") + "\n"
      );
      await new Promise((r) => setTimeout(r, 200));
    }
```

Note: This opens a `try {` block. The existing `catch` block remains — it will close this `try`. Leave the caveman section and everything after it intact.

- [ ] **Step 6: Update catch block to use new spinner.stop()**

Find:

```js
  } catch (err) {
    spinner.stop("Installation failed");
    p.log.error(err.message);
    process.exit(1);
  }
```

Replace with:

```js
  } catch (err) {
    if (spinner) {
      spinner.stop(pc.red("Installation failed"));
    }
    p.log.error(err.message);
    process.exit(1);
  }
```

- [ ] **Step 7: Replace the celebration placeholder with the real call**

Find the placeholder inserted in Step 4:

```js
    // <<CELEBRATION_PLACEHOLDER>>
```

Replace with:

```js
    // Outro celebration
    const nextSteps = [
      "📖  Read   " + pc.cyan("skills/yellowpages/SKILL.md"),
      "🤖  Open   " + pc.cyan("your agent platform"),
      "⚡  Run    " + pc.yellow("/yellowpages to get started"),
    ];
    await celebration(nextSteps, isInteractive);
  } // closes the try { opened in Step 5 — the catch block that follows in the original code remains unchanged
```

- [ ] **Step 8: Lint check**

From `packages/yp-stack/`:

```bash
npm run lint
```

Expected: Zero errors. Fix any oxlint issues before continuing.

- [ ] **Step 9: Verify VERSION is dynamic**

```bash
node --input-type=module <<'EOF'
import { createRequire } from 'module';
const req = createRequire(import.meta.url);
// Simulate what index.js now does
const { version } = req('./package.json');
console.log('VERSION:', version);
EOF
```

Expected: `VERSION: 0.1.1` (matches `package.json` — not the old hardcoded `0.1.0`).

- [ ] **Step 10: Commit**

From repo root:

```bash
git add packages/yp-stack/src/index.js
git commit -m "feat(yp-stack): wire splash, install animation, and celebration into index.js"
```

---

## Chunk 4: Final verification

### Task 7: End-to-end manual test

**Files:** None (verification only)

- [ ] **Step 1: Run the full installer interactively in a temp dir**

```bash
mkdir /tmp/yp-test-run
cd /tmp/yp-test-run
node $REPO/packages/yp-stack/bin/cli.js
```

Walk through prompts selecting:
- Platform: Claude Code (or whatever is detected)
- Location: This project only
- Scope: Full stack
- Project type: New
- State tracking: yes
- Config: yes
- Caveman: no

Verify each visual element:
- [ ] Screen clears softly (scrollback preserved), ASCII art header renders in yellow→orange gradient
- [ ] Tagline types out character by character, blinking cursor appears then disappears
- [ ] Version badge shows correct version (e.g. `v0.1.1`) — NOT `v0.1.0`
- [ ] Step counter shows in yellow `[1 of N]` (not dim gray)
- [ ] Detected platforms highlighted in cyan in the platform list
- [ ] Pre-install progress bar fills and clears cleanly
- [ ] Files stream line-by-line: `+` in green, paths in cyan, skipped in yellow/dim
- [ ] Spinner never overwrites a file line
- [ ] Completion line: bold green `✔` with file counts
- [ ] "DONE!" ASCII art fades in line-by-line (green→teal)
- [ ] Next steps note box displays
- [ ] Sign-off gradient line prints

- [ ] **Step 2: Test Ctrl+C during animation restores cursor**

Run the installer interactively. During the splash typewriter phase, press `Ctrl+C`.

```bash
# After exit, verify cursor is visible:
echo "cursor visible check"
```

Expected: Terminal cursor is visible, shell is fully usable after Ctrl+C. Exit code should be 130.

- [ ] **Step 3: Test non-interactive (piped) produces clean output**

```bash
node $REPO/packages/yp-stack/bin/cli.js < /dev/null 2>&1 | head -3 | cat -v
```

Expected: First line is `yp-stack v0.1.1` with no `^[` escape sequences. Process then enters clack's non-TTY prompt handling (which may exit or prompt differently — that's @clack's behavior, not ours).

- [ ] **Step 4: Test CI env produces clean output**

```bash
CI=1 node $REPO/packages/yp-stack/bin/cli.js < /dev/null 2>&1 | head -3 | cat -v
```

Expected: Same as Step 3 — clean `yp-stack v0.1.1`, no escape codes.

- [ ] **Step 5: Clean up temp dir**

```bash
rm -rf /tmp/yp-test-run
```

- [ ] **Step 6: Final commit**

From repo root:

```bash
git status
git add -p  # review and stage any remaining changes
git commit -m "feat(yp-stack): npx installer ASCII animation experience complete"
```
