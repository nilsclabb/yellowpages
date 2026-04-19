/**
 * Global yellowpages config — read/write ~/.yellowpages/config.yaml.
 *
 * Format: plain `key: value` lines, one per line. Parsed with a narrow
 * grep-style reader (no YAML dependency). First `set` writes an annotated
 * header documenting every key; subsequent sets update in place via a
 * temp file + rename for portability.
 *
 * CLI surface: `yp-stack config {get|set|list|defaults|path|edit} [key] [value]`
 *
 * Env overrides (for testing):
 *   YP_STATE_DIR  — override ~/.yellowpages state directory
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

// ── Config paths ──────────────────────────────────────────────────────────

export function stateDir() {
  return process.env.YP_STATE_DIR || path.join(os.homedir(), ".yellowpages");
}

export function configPath() {
  return path.join(stateDir(), "config.yaml");
}

// ── DEFAULTS table — canonical source of default values ───────────────────
//
// Keep in sync with CONFIG_HEADER below. `validateDefaults()` enforces
// parity between this table and CLOSED_DOMAIN_VALUES via a test.

export const DEFAULTS = Object.freeze({
  platform: "",
  scope: "full",
  caveman: "full",
  state_tracking: "true",
  auto_upgrade: "false",
  update_check: "true",
  default_host: "auto",
  default_install_location: "global",
  team_mode: "",
});

// Closed-domain value whitelists. `set` warns + coerces to default on mismatch.
const CLOSED_DOMAIN_VALUES = Object.freeze({
  platform: ["", "claude", "cursor", "windsurf", "copilot", "cline", "roo", "opencode", "generic"],
  scope: ["full", "skill", "minimal"],
  caveman: ["off", "lite", "full", "ultra"],
  state_tracking: ["true", "false"],
  auto_upgrade: ["true", "false"],
  update_check: ["true", "false"],
  default_host: [
    "auto",
    "claude",
    "cursor",
    "windsurf",
    "copilot",
    "cline",
    "roo",
    "opencode",
    "generic",
  ],
  default_install_location: ["global", "project"],
  team_mode: ["", "optional", "required"],
});

// Annotated header written on first `set`. Pure documentation — not the
// source of defaults.
const CONFIG_HEADER = `# yellowpages configuration — edit freely, changes take effect on next install.
# Docs: https://github.com/nilsclabb/yellowpages
#
# ─── Platform ────────────────────────────────────────────────────────
# platform: ""                    # claude | cursor | windsurf | copilot | cline |
#                                 # roo | opencode | generic | "" (auto-detect)
#
# ─── Install defaults ────────────────────────────────────────────────
# scope: full                     # full | skill | minimal
# state_tracking: true            # cross-session learnings + gates
# default_install_location: global  # global | project
#
# ─── Caveman terse mode ──────────────────────────────────────────────
# caveman: full                   # off | lite | full | ultra
#                                 # toggle live with /caveman from any session
#
# ─── Updates ─────────────────────────────────────────────────────────
# auto_upgrade: false             # true = silently upgrade on session start
# update_check: true              # false = suppress version check notifications
#
# ─── Host detection ──────────────────────────────────────────────────
# default_host: auto              # auto = detect by \`command -v\`
#
# ─── Team mode ───────────────────────────────────────────────────────
# team_mode: ""                   # "" | optional | required
#                                 # populated by \`npx yp-stack --team {optional|required}\`
#
`;

// ── Key + value validation ────────────────────────────────────────────────

const KEY_RE = /^[a-zA-Z0-9_]+$/;

export function isValidKey(key) {
  return typeof key === "string" && KEY_RE.test(key);
}

function coerceClosedDomain(key, value) {
  const allowed = CLOSED_DOMAIN_VALUES[key];
  if (!allowed) return { value, warned: false };
  if (allowed.includes(value)) return { value, warned: false };
  return {
    value: DEFAULTS[key] ?? "",
    warned: true,
    allowed,
  };
}

// ── Parse + serialize ─────────────────────────────────────────────────────

function parseConfigText(text) {
  if (!text) return {};
  const out = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    if (!isValidKey(key)) continue;
    const value = line
      .slice(idx + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    out[key] = value;
  }
  return out;
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return "";
  }
}

function ensureStateDir() {
  const dir = stateDir();
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// Atomic write: write to temp, rename over target.
function atomicWrite(targetPath, content) {
  const dir = path.dirname(targetPath);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = `${targetPath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, content, "utf-8");
  fs.renameSync(tmp, targetPath);
}

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Return the raw contents of the config file as an object of set keys.
 * Missing file → {}.
 */
export function readRawConfig() {
  return parseConfigText(readFileSafe(configPath()));
}

/**
 * Get a single config value. Falls back to DEFAULTS when the key is unset.
 * Returns an empty string when the key is unknown.
 */
export function getConfig(key) {
  if (!isValidKey(key)) {
    throw new Error("key must contain only alphanumeric characters and underscores");
  }
  const raw = readRawConfig();
  if (Object.prototype.hasOwnProperty.call(raw, key)) return raw[key];
  if (Object.prototype.hasOwnProperty.call(DEFAULTS, key)) return DEFAULTS[key];
  return "";
}

/**
 * Set a single config value. Creates the config file with an annotated
 * header on first write. Updates in place otherwise.
 *
 * Returns { written, warning } where `warning` is present when a
 * closed-domain value was coerced to default.
 */
export function setConfig(key, value) {
  if (!isValidKey(key)) {
    throw new Error("key must contain only alphanumeric characters and underscores");
  }
  if (typeof value !== "string") value = String(value ?? "");
  // Drop embedded newlines — values must fit on one line.
  const sanitized = value.split(/\r?\n/)[0].trim();
  const { value: finalValue, warned, allowed } = coerceClosedDomain(key, sanitized);

  ensureStateDir();
  const cfgPath = configPath();
  const existing = readFileSafe(cfgPath);

  let next;
  if (!existing) {
    // First write — prepend the header.
    next = `${CONFIG_HEADER}${key}: ${finalValue}\n`;
  } else if (new RegExp(`^${escapeRegExp(key)}:`, "m").test(existing)) {
    // Update in place — preserve header + other keys.
    next = existing.replace(new RegExp(`^${escapeRegExp(key)}:.*$`, "m"), `${key}: ${finalValue}`);
  } else {
    // Append new key at end.
    next = existing.endsWith("\n")
      ? existing + `${key}: ${finalValue}\n`
      : existing + `\n${key}: ${finalValue}\n`;
  }

  atomicWrite(cfgPath, next);

  const warning = warned
    ? `value '${sanitized}' not recognized for key '${key}'. ` +
      `Valid values: ${allowed.join(", ")}. Using '${finalValue}'.`
    : null;

  return { written: finalValue, warning };
}

/**
 * Unset a single key (removes the line from the config file).
 * No-op if the key is absent or the file does not exist.
 */
export function unsetConfig(key) {
  if (!isValidKey(key)) {
    throw new Error("key must contain only alphanumeric characters and underscores");
  }
  const cfgPath = configPath();
  const existing = readFileSafe(cfgPath);
  if (!existing) return false;
  const re = new RegExp(`^${escapeRegExp(key)}:.*\r?\n?`, "m");
  if (!re.test(existing)) return false;
  atomicWrite(cfgPath, existing.replace(re, ""));
  return true;
}

/**
 * Return a merged view: every known default key plus any extra keys
 * present in the file, with source markers.
 *
 * Shape: { [key]: { value, source: 'set' | 'default' } }
 */
export function listConfig() {
  const raw = readRawConfig();
  const out = {};
  for (const key of Object.keys(DEFAULTS)) {
    if (Object.prototype.hasOwnProperty.call(raw, key)) {
      out[key] = { value: raw[key], source: "set" };
    } else {
      out[key] = { value: DEFAULTS[key], source: "default" };
    }
  }
  // Surface any extra keys the user has set that aren't in DEFAULTS.
  for (const key of Object.keys(raw)) {
    if (!Object.prototype.hasOwnProperty.call(out, key)) {
      out[key] = { value: raw[key], source: "set (unknown key)" };
    }
  }
  return out;
}

/**
 * Resolve all installer-relevant config into a typed object. Used by
 * src/index.js to short-circuit prompts when a value is set.
 *
 * Returns an object with one property per known default key, plus a
 * `hasConfig` boolean that is true only if the config file exists.
 */
export function resolveConfig() {
  const raw = readRawConfig();
  const hasConfig = Object.keys(raw).length > 0 || fs.existsSync(configPath());
  const resolved = { hasConfig };
  for (const key of Object.keys(DEFAULTS)) {
    const value = Object.prototype.hasOwnProperty.call(raw, key) ? raw[key] : DEFAULTS[key];
    const source = Object.prototype.hasOwnProperty.call(raw, key) ? "set" : "default";
    resolved[key] = { value, source };
  }
  return resolved;
}

/**
 * Persist the resolved choices from a completed install into the config
 * file. Called after a successful first-run Clack flow so that future
 * runs in new repos short-circuit.
 *
 * Only writes keys that are not already set.
 */
export function persistInstallChoices(choices) {
  const raw = readRawConfig();
  const written = [];
  for (const [key, value] of Object.entries(choices)) {
    if (!isValidKey(key)) continue;
    if (Object.prototype.hasOwnProperty.call(raw, key)) continue;
    if (value === undefined || value === null) continue;
    setConfig(key, String(value));
    written.push(key);
  }
  return written;
}

// ── CLI handler ───────────────────────────────────────────────────────────

/**
 * Run the `yp-stack config …` subcommand. Invoked from bin/cli.js.
 *
 * @param {string[]} argv  Arguments AFTER the `config` keyword
 * @returns {number}  Exit code
 */
export function runConfigCli(argv) {
  const sub = argv[0];
  switch (sub) {
    case "get":
      return cliGet(argv.slice(1));
    case "set":
      return cliSet(argv.slice(1));
    case "unset":
      return cliUnset(argv.slice(1));
    case "list":
    case undefined:
    case "":
      return cliList();
    case "defaults":
      return cliDefaults();
    case "path":
      process.stdout.write(configPath() + "\n");
      return 0;
    case "edit":
      return cliEdit();
    case "-h":
    case "--help":
    case "help":
      printHelp();
      return 0;
    default:
      process.stderr.write(`Unknown subcommand: ${sub}\n`);
      printHelp();
      return 1;
  }
}

function printHelp() {
  const lines = [
    "Usage: yp-stack config <subcommand> [args]",
    "",
    "Subcommands:",
    "  get <key>          Print the value for <key>, or its default.",
    "  set <key> <value>  Set <key> to <value>. Writes the config file if missing.",
    "  unset <key>        Remove <key> from the config file.",
    "  list               Print all known keys with their value + source.",
    "  defaults           Print the DEFAULTS table only.",
    "  path               Print the absolute config file path.",
    "  edit               Open the config file in $EDITOR.",
    "",
    `Config file: ${configPath()}`,
  ];
  process.stdout.write(lines.join("\n") + "\n");
}

function cliGet(args) {
  const key = args[0];
  if (!key) {
    process.stderr.write("Usage: yp-stack config get <key>\n");
    return 1;
  }
  try {
    const value = getConfig(key);
    process.stdout.write(value + "\n");
    return 0;
  } catch (err) {
    process.stderr.write(`Error: ${err.message}\n`);
    return 1;
  }
}

function cliSet(args) {
  const key = args[0];
  const value = args[1];
  if (!key || value === undefined) {
    process.stderr.write("Usage: yp-stack config set <key> <value>\n");
    return 1;
  }
  try {
    const { written, warning } = setConfig(key, value);
    if (warning) process.stderr.write(`Warning: ${warning}\n`);
    process.stdout.write(`${key}: ${written}\n`);
    return 0;
  } catch (err) {
    process.stderr.write(`Error: ${err.message}\n`);
    return 1;
  }
}

function cliUnset(args) {
  const key = args[0];
  if (!key) {
    process.stderr.write("Usage: yp-stack config unset <key>\n");
    return 1;
  }
  try {
    const removed = unsetConfig(key);
    process.stdout.write(removed ? `unset ${key}\n` : `${key} was not set\n`);
    return 0;
  } catch (err) {
    process.stderr.write(`Error: ${err.message}\n`);
    return 1;
  }
}

function cliList() {
  const entries = listConfig();
  const cfgPath = configPath();
  if (fs.existsSync(cfgPath)) {
    process.stdout.write(`# ${cfgPath}\n`);
  } else {
    process.stdout.write(
      `# (no config file; defaults only — run \`yp-stack config set\` to create)\n`,
    );
  }
  const width = Math.max(...Object.keys(entries).map((k) => k.length));
  for (const [key, { value, source }] of Object.entries(entries)) {
    process.stdout.write(`  ${key.padEnd(width)}  ${JSON.stringify(value)}  (${source})\n`);
  }
  return 0;
}

function cliDefaults() {
  const width = Math.max(...Object.keys(DEFAULTS).map((k) => k.length));
  process.stdout.write("# DEFAULTS\n");
  for (const [key, value] of Object.entries(DEFAULTS)) {
    process.stdout.write(`  ${key.padEnd(width)}  ${JSON.stringify(value)}\n`);
  }
  return 0;
}

function cliEdit() {
  const cfgPath = configPath();
  // Ensure file exists (with header) so $EDITOR has something useful to show.
  if (!fs.existsSync(cfgPath)) {
    ensureStateDir();
    atomicWrite(cfgPath, CONFIG_HEADER);
  }
  const editor = process.env.EDITOR || process.env.VISUAL;
  if (!editor || !process.stdin.isTTY) {
    process.stdout.write(cfgPath + "\n");
    return 0;
  }
  const result = spawnSync(editor, [cfgPath], { stdio: "inherit" });
  return result.status ?? 0;
}

// ── Helpers ───────────────────────────────────────────────────────────────

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
