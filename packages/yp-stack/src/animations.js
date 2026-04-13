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
  try {
    for (const char of text) {
      process.stdout.write(char);
      await sleep(delayMs);
    }
    // Blink cursor briefly then remove it
    process.stdout.write(pc.dim('|'));
    await sleep(180);
    process.stdout.write('\b \b');
  } finally {
    process.stdout.write(SHOW_CURSOR);
    process.stdout.write('\n');
  }
}

// ── fillBar ──────────────────────────────────────────────────────────────────

/**
 * Animate a fill bar left-to-right in ~durationMs.
 * Colors: cyan at start, green at end. Clears the bar line when done.
 */
export async function fillBar(widthChars = 20, durationMs = 600) {
  process.stdout.write(HIDE_CURSOR);
  try {
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
  } finally {
    process.stdout.write(SHOW_CURSOR);
  }
}

// ── revealLines ──────────────────────────────────────────────────────────────

/**
 * Print an array of strings with per-line delay.
 * Hides cursor during reveal, restores after.
 */
export async function revealLines(lines, delayMs = 40) {
  process.stdout.write(HIDE_CURSOR);
  try {
    for (const line of lines) {
      process.stdout.write(line + '\n');
      await sleep(delayMs);
    }
  } finally {
    process.stdout.write(SHOW_CURSOR);
  }
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
      if (timer) return; // already running
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
      process.stdout.write(HIDE_CURSOR);
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
