/**
 * TTY and CI detection.
 * isInteractive is true only when running in a real interactive terminal.
 * Respects: CI env var, dumb terminals, NO_COLOR convention (no-color.org).
 */
export const isInteractive =
  Boolean(process.stdout.isTTY) &&
  !process.env.CI &&
  process.env.TERM !== "dumb" &&
  !process.env.NO_COLOR;
