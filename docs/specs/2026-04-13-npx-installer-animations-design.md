# NPX Installer Animations — Design Spec

**Date:** 2026-04-13
**Package:** `yp-stack`
**Status:** Approved

---

## Overview

Enhance the `yp-stack` npx installer with a fun, polished ASCII animation experience across the full end-to-end installation flow. The experience combines playful character with technical polish — rich ASCII art, gradient colors, animated spinners, and per-file progress — while degrading gracefully in non-interactive environments.

---

## Goals

- Make the install experience visually memorable and fun
- Maintain existing @clack/prompts interactive prompt behavior
- Degrade gracefully in CI, piped output, and non-TTY contexts
- Add color throughout for visual richness

---

## Non-Goals

- Supporting interactive animations in non-TTY environments
- Artificial slowdowns that hurt real install performance (except small theatrical pauses in splash/outro)

---

## Architecture

### New Files

**`src/tty.js`**
TTY and CI detection. Exports a single `isInteractive` boolean used by all animation code to gate effects.

```js
export const isInteractive =
  Boolean(process.stdout.isTTY) &&
  !process.env.CI &&
  process.env.TERM !== 'dumb' &&
  !process.env.NO_COLOR;  // respects no-color.org convention
```

**`src/animations.js`**
All animation primitives and higher-level sequences. Imports `@clack/prompts` for `p.note()` used in `celebration()`.

Primitives:
- `typewriter(text, delayMs)` — character-by-character stdout write with blinking `|` cursor. Hides cursor on start (`\x1B[?25l`), restores on finish (`\x1B[?25h`).
- `fillBar(widthChars, durationMs)` — animated `▓` progress bar, cyan→green. Hides cursor, fills, clears completed bar with `\x1B[2K\r`, restores cursor.
- `revealLines(lines, delayMs)` — hides cursor, prints lines with per-line delay, restores cursor.
- `customSpinner(frames, intervalMs)` — returns spinner controller (see interface below)
- `splash()` — full opening sequence. Must restore cursor before returning.
- `celebration(nextSteps)` — full outro sequence, accepts next-steps strings array

**`customSpinner` interface:**
```js
const spinner = customSpinner(['◐','◓','◑','◒'], 80);
spinner.start(label);      // hides cursor, begins frame loop on current line
spinner.update(label);     // swaps label text only, continues frames on same line
spinner.stop(finalMsg);    // halts loop, clears spinner line (\x1B[2K\r), prints finalMsg, restores cursor
                           // finalMsg is optional — if omitted or empty string, line is cleared with no output
spinner.pause();           // halt interval, clear current spinner line
spinner.resume();          // restart interval on current line position
```

**Cursor management global guard** — `animations.js` registers on load:
```js
process.on('SIGINT', () => {
  process.stdout.write('\x1B[?25h'); // always restore cursor on Ctrl+C
  process.exit(130);
});
```

### Modified Files

**`src/install.js`**
Add optional `onFile` callback parameter to `installFiles()`:

```js
// Before:
async function installFiles(options)

// After:
async function installFiles(options, onFile = null)
// onFile(absPath, status) called immediately after each file write
// status: 'created' | 'skipped'
// absPath: absolute path (same value pushed to result.created/skipped)
// Caller (index.js) applies displayPath(absPath) before rendering to terminal
```

`onFile` is called inside both the skill-files loop and the governance-files loop, passing the raw absolute path. In `index.js`, the `onFile` callback passes `absPath` through `displayPath()` before printing — matching existing behavior for the batched results display. The `learnings.jsonl` special-case (written outside the two main loops, appended directly to `result.created`) does NOT call `onFile` — it appears only in the Act 3 count summary.

All other `install.js` logic unchanged.

**`src/index.js`**
- Replace `p.intro()` with `splash()`
- Pass `onFile` callback to `installFiles()` for streaming per-file output during Act 2 (spinner running)
- Replace `p.spinner()` install block with animated 3-act sequence
- `writeConfig` and `appendToInstructions` (called after `installFiles()`) do NOT stream via `onFile` — their files appear only in the Act 3 count summary alongside `learnings.jsonl`
- In error `catch` block: call `spinner.stop("Installation failed")` (not just stop) to clear spinner line and restore cursor before any error output
- `celebration()` called after caveman prompt (see ordering below)
- Replace `p.outro()` call with `celebration()`
- Read `VERSION` dynamically from `package.json` (see Version section)
- Add color touches to prompt messages and option labels throughout

**`package.json`**
Add two dependencies:
- `figlet` — ASCII art text rendering
- `gradient-string` — terminal gradient/rainbow colors

---

## ESM Compatibility Notes

Both `figlet` and `gradient-string` ship as CJS. They work in this ESM project via Node's CJS interop with default imports:

```js
import figlet from 'figlet';
import gradient from 'gradient-string';
```

Do NOT use named imports — neither package exports named exports.

**figlet:** Use `figlet.textSync(text, { font })` (synchronous). Do not use the callback-based `figlet.text()` unless wrapped in a Promise. `ANSI Shadow` is bundled with figlet — no additional font loading needed. Verify with `figlet.fontsSync().includes('ANSI Shadow')` during development.

**gradient-string:** Two usage patterns:

```js
// Custom gradient — pass color array, call result as function:
const yellowToOrange = gradient(['#f9d71c', '#ff8c00']);
console.log(yellowToOrange('some text'));

// Named preset — call directly as method:
console.log(gradient.atlas('some text'));
// Other presets: cristal, teen, mind, morning, vice, passion, fruit, instagram, retro, summer, rainbow, pastel
```

---

## Version

Do NOT use the hardcoded `VERSION` constant in `index.js` (currently stale — `"0.1.0"` vs `package.json` `"0.1.1"`). Read version dynamically:

```js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { version: VERSION } = require('../package.json');
// index.js is at src/index.js — ../package.json resolves to packages/yp-stack/package.json ✓
```

Apply this fix in `index.js` as part of this implementation.

---

## Cursor Management

`animations.js` owns cursor lifecycle during animation sequences:
- Hide cursor before any animation that overwrites lines: `process.stdout.write('\x1B[?25l')`
- Restore cursor after animation completes or on error: `process.stdout.write('\x1B[?25h')`
- `splash()` must restore cursor before returning so `@clack/prompts` takes over with clean terminal state
- `customSpinner.stop()` always restores cursor
- `SIGINT` handler registered at module load restores cursor and exits with code 130

---

## Spinner + Streaming File Lines

The spinner and streaming file output must not conflict. The prescribed approach:

1. `spinner.start(label)` begins a frame loop that rewrites the current line via `\r` (no newline)
2. When `onFile` fires, the callback in `index.js`:
   a. Calls `spinner.pause()` — halts the interval, clears spinner line with `\x1B[2K\r`
   b. Writes the file line with a trailing newline: `process.stdout.write(formattedLine + '\n')`
   c. Calls `spinner.resume()` — restarts the interval on the now-current (next) line

This ensures spinner and file lines never compete for the same terminal line. `pause()` and `resume()` are part of the `customSpinner` interface defined in the Architecture section.

---

## Screen Clearing

`splash()` uses soft clear (visible area only, preserves scrollback):
```js
process.stdout.write('\x1B[2J\x1B[H');
```
Not `console.clear()`, which clears scrollback in some terminals.

---

## Animation Sequences

### Section 1: Splash & Intro

Triggered at startup, before any prompts.

**Steps:**
1. Soft clear + 80ms pause
2. Hide cursor
3. Figlet ASCII art header — `figlet.textSync('yp-stack', { font: 'ANSI Shadow' })`
4. Gradient wash — `gradient(['#f9d71c','#ff8c00','#ff6b00'])(asciiArt)` across all rows
5. Typewriter tagline — `"Agent skills & workflows, installed."` at 30ms/char with blinking `|` cursor
6. Version badge — `pc.dim("v" + VERSION + " · npx yp-stack")`
7. Thin divider — `pc.dim("─".repeat(50))`
8. Restore cursor (clack takes over)

**Non-TTY fallback:** `console.log("yp-stack v" + VERSION)`, skip all animation.

---

### Section 2: Prompt Phase Color

The interactive prompts (@clack/prompts) remain unchanged structurally. Enhancements:
- Platform option labels colored `pc.cyan()` for detected platforms
- Step counter `[N of M]` colored `pc.yellow()` instead of dim
- Confirmation prompts use `pc.green()` for positive option, `pc.yellow()` for negative

**Non-TTY note:** `picocolors` auto-detects color support and disables itself. No explicit fallback needed.

---

### Section 3: Install Phase Animation

Replaces the current single `p.spinner()` block. The caveman prompt (`p.confirm()`) remains after this sequence, before `celebration()`.

**Act 1: Pre-install bar (theatrical)**
- Print `pc.cyan("⚡ Preparing yellowpages v" + VERSION + "...")`
- Animated fill bar: `▓` characters fill left-to-right over ~600ms, color transitions cyan→green
- Bar cleared with `\x1B[2K\r` after completion

```
  ⚡ Preparing yellowpages v0.1.1...
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  100%
```

**Act 2: Per-file animated reveal**
- `customSpinner(['◐','◓','◑','◒'], 80)` — colored `pc.cyan()`
- Spinner label updates by file category: `"Installing skills..."` → `"Installing governance..."` etc.
- Each file printed immediately via `onFile` callback using pause/resume pattern (see Spinner + Streaming File Lines):
  - `onFile` receives `absPath` — `index.js` applies `displayPath(absPath)` before rendering
  - Created: `pc.green("+") + " " + pc.cyan(displayPath(absPath))`
  - Skipped: `pc.yellow("~") + " " + pc.dim(displayPath(absPath)) + pc.dim(" (exists, skipped)")`
- `learnings.jsonl`, `yellowpages.config.json`, and `CLAUDE.md (appended)` do NOT stream — counted in Act 3 summary only

**Act 3: Completion burst**
- `spinner.stop()` — clears spinner line, restores cursor
- Total counts include all files: streamed + non-streamed (`learnings.jsonl`, config, CLAUDE.md append)
- Print `pc.bold(pc.green("✔")) + " " + pc.bold(total_created + " files installed") + pc.dim(" · ") + pc.yellow(total_skipped + " skipped")`
- 200ms pause

**Error path:** If `installFiles()` throws, `catch` block must call `spinner.stop("Installation failed")` to clear spinner line and restore cursor before logging the error.

**Non-TTY fallback:** Plain file list (existing behavior), no spinner, no bar.

---

### Section 4: Outro & Celebration

`celebration()` is called from `index.js` after the caveman prompt completes (replacing the current `p.outro()` call). Flow: prompts → install animation → caveman prompt → `celebration()`.

**Beat 1: Success ASCII art**
- `figlet.textSync('DONE!', { font: 'Small' })`
- Gradient: `gradient(['#00b09b','#96c93d'])(asciiArt)` (green→teal)
- Lines reveal with 40ms per-line delay (hide cursor, reveal, restore)

**Beat 2: Next steps note**
- `p.note()` from `@clack/prompts` with title `"What's next?"`
- `animations.js` imports and calls `p.note()` directly (acknowledged coupling)
- Contents (passed in as `nextSteps` array from `index.js`):
  - `"📖  Read   " + pc.cyan("skills/yellowpages/SKILL.md")`
  - `"🤖  Open   " + pc.cyan("your agent platform")`
  - `"⚡  Run    " + pc.yellow("/yellowpages to get started")`

**Beat 3: Sign-off**
- Single line: `"  " + pc.bold(pc.yellow("◆")) + "  " + gradient.atlas("Yellowpages is ready. Go build something great.")`
- Note: `p.note()` box already ends with a `◆` from clack's styling. The sign-off `◆` should be visually distinct — use 2-space indent and `pc.bold()` to differentiate.

**Non-TTY fallback:** Plain next-steps list + `"Done! Yellowpages is ready."` line.

---

## Color Palette

| Use | Color |
|-----|-------|
| Splash ASCII art | yellow→amber→orange gradient |
| Spinner | cyan |
| Created files `+` | bold green |
| Skipped files `~` | yellow |
| File paths | cyan |
| Step counter | yellow |
| Progress bar fill | cyan→green |
| Completion checkmark | bold green |
| Outro ASCII art | green→teal gradient |
| Sign-off diamond `◆` | bold yellow |
| Sign-off text | gradient.atlas preset |
| Dim/metadata | dim |

---

## Dependencies

| Package | Purpose | Import style |
|---------|---------|------|
| `figlet` | ASCII art text (splash + outro) | `import figlet from 'figlet'` |
| `gradient-string` | Terminal gradient colors | `import gradient from 'gradient-string'` |

Both: CJS packages, Node CJS interop works fine in this ESM project.

---

## File Structure After Implementation

```
packages/yp-stack/
├── bin/cli.js                  (unchanged)
├── src/
│   ├── index.js                (modified — splash/install animation/celebration + VERSION fix + onFile wiring)
│   ├── animations.js           (new — all animation primitives + sequences)
│   ├── tty.js                  (new — TTY/CI/NO_COLOR detection)
│   ├── install.js              (modified — add optional onFile callback to installFiles())
│   ├── caveman.js              (unchanged)
│   └── content.js              (unchanged, generated)
└── package.json                (add figlet, gradient-string)
```

---

## Success Criteria

- Interactive TTY: full animation plays end-to-end without errors or terminal state corruption
- CI / non-TTY: install completes with plain text output, no broken escape codes
- No regression in prompt behavior or install logic
- Per-file output streams during install via `onFile` callback + pause/resume pattern
- Spinner and file lines never conflict (pause/resume coordination)
- `animations.js` isolated — `index.js` changes are call-site swaps + `onFile` wiring
- `install.js` change: one optional `onFile` callback parameter added to `installFiles()`
- Cursor always restored before `@clack` prompts take over, and on `SIGINT`
- `VERSION` read dynamically from `package.json`, not hardcoded
- `learnings.jsonl`, config, and CLAUDE.md append counted in summary but not streamed per-file
