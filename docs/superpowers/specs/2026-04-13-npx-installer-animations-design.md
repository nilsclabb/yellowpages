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

- Rewriting prompt logic or install.js behavior
- Supporting interactive animations in non-TTY environments
- Artificial slowdowns that hurt real install performance (except small theatrical pauses in the splash/outro)

---

## Architecture

### New Files

**`src/tty.js`**
TTY and CI detection. Exports a single `isInteractive` boolean used by all animation code to gate effects.

```js
export const isInteractive = process.stdout.isTTY && !process.env.CI && process.env.TERM !== 'dumb';
```

**`src/animations.js`**
All animation primitives and higher-level sequences:
- `typewriter(text, delayMs)` — character-by-character print with blinking cursor
- `fillBar(widthChars, durationMs)` — animated ASCII progress bar (cyan→green gradient)
- `revealLines(lines, delayMs)` — print lines with per-line delay
- `customSpinner(frames, intervalMs)` — returns start/stop/update API using custom frame arrays
- `splash()` — full opening sequence (clear, figlet, gradient, typewriter tagline, version badge, divider)
- `celebration()` — full outro sequence (figlet DONE, gradient, next-steps note, sign-off)

### Modified Files

**`src/index.js`**
- Replace `p.intro()` with `splash()`
- Replace `p.spinner()` install block with animated per-file reveal using `customSpinner` + streaming file output
- Replace `p.outro()` with `celebration()`
- Add color touches to prompt messages and option labels throughout

**`package.json`**
Add two dependencies:
- `figlet` — ASCII art text rendering (~180kB, zero native deps)
- `gradient-string` — terminal gradient/rainbow color (~15kB, zero native deps)

---

## Animation Sequences

### Section 1: Splash & Intro

Triggered at startup, before any prompts.

**Steps:**
1. `console.clear()` + 80ms pause
2. Figlet ASCII art header — font: `ANSI Shadow`, text: `yp-stack`
3. Gradient wash — yellow→amber→orange across all ASCII art rows via `gradient-string`
4. Typewriter tagline — `"Agent skills & workflows, installed."` at 30ms/char with blinking `|` cursor
5. Version badge — dim `v{VERSION} · npx yp-stack`
6. Thin divider — `pc.dim("─".repeat(50))`

**Non-TTY fallback:** Print `yp-stack v{VERSION}` as plain text, skip all animation.

---

### Section 2: Prompt Phase Color

The interactive prompts (@clack/prompts) remain unchanged structurally. Enhancements:
- Platform option labels colored `pc.cyan()` for detected platforms
- Step counter `[N of M]` colored `pc.yellow()` instead of dim
- Confirmation prompts use `pc.green()` for positive option, `pc.yellow()` for negative

---

### Section 3: Install Phase Animation

Replaces the current single `p.spinner()` block with a 3-act sequence.

**Act 1: Pre-install bar (theatrical)**
- Print `pc.cyan("⚡ Preparing yellowpages v{VERSION}...")`
- Animated fill bar: `▓` characters fill left-to-right over ~600ms, color transitions cyan→green
- Completes at 100% then clears the bar line

```
  ⚡ Preparing yellowpages v0.1.1...
  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  100%
```

**Act 2: Per-file animated reveal**
- Custom spinner using braille frames `◐ ◓ ◑ ◒` at 80ms interval, colored `pc.cyan()`
- Spinner label updates: `"Installing skills..."` → `"Installing governance..."` etc. by file category
- Each file prints immediately on write (streaming, not batched):
  - Created: `pc.green("+") + " " + pc.cyan(relativePath)`
  - Skipped: `pc.yellow("~") + " " + pc.dim(relativePath) + pc.dim(" (exists, skipped)")`

**Act 3: Completion burst**
- Spinner stops, replaced with `pc.bold(pc.green("✔"))` checkmark
- Summary line: `pc.bold("24 files installed") + pc.dim(" · ") + pc.yellow("3 skipped")`
- 200ms pause before outro

**Non-TTY fallback:** Plain file list (existing behavior), no spinner, no bar.

---

### Section 4: Outro & Celebration

Replaces `p.outro()`.

**Beat 1: Success ASCII art**
- Figlet text: `"DONE!"`, font: `Small`
- Gradient: green→teal
- Lines reveal with 40ms per-line delay

**Beat 2: Next steps note**
- @clack `p.note()` box with title `"What's next?"`
- Contents:
  - `📖  Read   skills/yellowpages/SKILL.md` — `pc.cyan()`
  - `🤖  Open   your agent platform` — `pc.cyan()`
  - `⚡  Run    /yellowpages to get started` — `pc.yellow()`

**Beat 3: Sign-off**
- `pc.bold(pc.yellow("◆"))` + gradient yellow→white text: `"Yellowpages is ready. Go build something great."`

**Non-TTY fallback:** Plain next-steps list + `"Done! Yellowpages is ready."` line.

---

## Color Palette

| Use | Color |
|-----|-------|
| Splash ASCII art | yellow→amber→orange gradient |
| Spinner | cyan |
| Created files `+` | green |
| Skipped files `~` | yellow |
| File paths | cyan |
| Step counter | yellow |
| Progress bar fill | cyan→green |
| Completion checkmark | bold green |
| Outro ASCII art | green→teal gradient |
| Sign-off diamond `◆` | bold yellow |
| Sign-off text | yellow→white gradient |
| Dim/metadata | dim (no color) |

---

## Dependencies

| Package | Version | Size | Purpose |
|---------|---------|------|---------|
| `figlet` | latest | ~180kB | ASCII art text (splash + outro) |
| `gradient-string` | latest | ~15kB | Terminal gradient colors |

Both: zero native deps, ESM compatible, well-maintained.

---

## TTY Detection

All animation sequences check `isInteractive` from `src/tty.js` before executing.

Conditions that disable animation:
- `process.stdout.isTTY` is falsy (piped output)
- `process.env.CI` is set (GitHub Actions, CircleCI, etc.)
- `process.env.TERM === 'dumb'` (minimal terminal)

@clack/prompts handles its own non-TTY behavior independently.

---

## File Structure After Implementation

```
packages/yp-stack/
├── bin/cli.js                  (unchanged)
├── src/
│   ├── index.js                (modified — swap intro/install/outro)
│   ├── animations.js           (new — all animation primitives + sequences)
│   ├── tty.js                  (new — TTY/CI detection)
│   ├── install.js              (unchanged)
│   ├── caveman.js              (unchanged)
│   └── content.js              (unchanged, generated)
└── package.json                (add figlet, gradient-string)
```

---

## Success Criteria

- Interactive TTY: full animation plays end-to-end without errors
- CI / non-TTY: install completes with plain text output, no broken escape codes
- No regression in prompt behavior or install logic
- Per-file output streams during install (not batched after completion)
- All new animation code isolated to `animations.js` — `index.js` changes are call-site swaps only
