/**
 * update-check.js — throttled remote-version check for yellowpages.
 *
 * Exports pure, testable helpers used by:
 *   - hooks/skills-manifest.js   (inlined at bundle time; see that file)
 *   - bin/cli.js snooze|check    (imported directly)
 *
 * State files under `stateDir()` (default `~/.yellowpages/`):
 *
 *   last-update-check     one line — result of the most recent remote fetch.
 *                         Format:
 *                           UP_TO_DATE         <local>                  <epoch>
 *                           UPGRADE_AVAILABLE  <local>  <remote>        <epoch>
 *                         Stale entries (older than the TTL for their kind)
 *                         trigger a refetch.
 *
 *   update-snoozed        `<remote-version> <level> <epoch>`.
 *                         Levels: 1=24h, 2=48h, 3+=7d.
 *                         Cleared automatically when the remote version
 *                         changes (because the snooze was about the old one).
 *
 *   just-upgraded-from    `<previous-version>`. Written by `yp-stack upgrade`
 *                         after a successful upgrade. Read + deleted once by
 *                         the hook so the upgrade banner surfaces exactly one
 *                         time.
 *
 * Network: HTTPS GET against a raw github URL. `--max-time 5` via AbortSignal.
 * Any error (DNS, non-200, bad JSON, bad version shape) is treated as "no
 * info" and the cached entry is kept.
 *
 * The module never throws during a check — it always resolves to a string
 * (the one-line manifest marker) or null. Callers can therefore concatenate
 * the result unconditionally.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import https from "node:https";
import http from "node:http";

// ── Constants ────────────────────────────────────────────────────────────────

const TTL_UP_TO_DATE_MS = 60 * 60 * 1000; //   60 minutes
const TTL_UPGRADE_AVAILABLE_MS = 12 * 60 * 60 * 1000; // 720 minutes

const SNOOZE_DURATIONS_MS = Object.freeze({
  1: 24 * 60 * 60 * 1000,
  2: 48 * 60 * 60 * 1000,
  // Level 3+ uses 7 days.
  _default: 7 * 24 * 60 * 60 * 1000,
});

const SEMVER_RE = /^\d+\.\d+\.\d+$/;

const DEFAULT_REMOTE_URL =
  "https://raw.githubusercontent.com/nilsclabb/yellowpages/main/packages/yp-stack/package.json";

function remoteUrl() {
  return process.env.YP_REMOTE_VERSION_URL || DEFAULT_REMOTE_URL;
}

const FETCH_TIMEOUT_MS = 5000;

// ── State paths ──────────────────────────────────────────────────────────────

export function stateDir() {
  return process.env.YP_STATE_DIR || path.join(os.homedir(), ".yellowpages");
}

export function lastCheckPath() {
  return path.join(stateDir(), "last-update-check");
}

export function snoozePath() {
  return path.join(stateDir(), "update-snoozed");
}

export function justUpgradedPath() {
  return path.join(stateDir(), "just-upgraded-from");
}

// ── Public helpers ───────────────────────────────────────────────────────────

export function isValidVersion(v) {
  return typeof v === "string" && SEMVER_RE.test(v);
}

/**
 * Compare two semver strings (`x.y.z`). Returns -1, 0, 1.
 * Assumes both inputs have already passed `isValidVersion`.
 */
export function compareVersions(a, b) {
  const pa = a.split(".").map((n) => parseInt(n, 10));
  const pb = b.split(".").map((n) => parseInt(n, 10));
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

export function snoozeDurationMs(level) {
  if (level === 1) return SNOOZE_DURATIONS_MS[1];
  if (level === 2) return SNOOZE_DURATIONS_MS[2];
  return SNOOZE_DURATIONS_MS._default;
}

// ── Cache read/write ─────────────────────────────────────────────────────────

/**
 * Parse the cache file. Returns null for missing, corrupt, or
 * unrecognised entries — callers treat null as "fetch again".
 */
export function readCache() {
  try {
    const raw = fs.readFileSync(lastCheckPath(), "utf-8").trim();
    if (!raw) return null;
    const parts = raw.split(/\s+/);
    const kind = parts[0];

    if (kind === "UP_TO_DATE" && parts.length >= 3) {
      const local = parts[1];
      const ts = parseInt(parts[2], 10);
      if (!isValidVersion(local) || !Number.isFinite(ts)) return null;
      return { kind, local, timestamp: ts };
    }

    if (kind === "UPGRADE_AVAILABLE" && parts.length >= 4) {
      const local = parts[1];
      const remote = parts[2];
      const ts = parseInt(parts[3], 10);
      if (!isValidVersion(local) || !isValidVersion(remote) || !Number.isFinite(ts)) return null;
      return { kind, local, remote, timestamp: ts };
    }

    return null;
  } catch {
    return null;
  }
}

export function writeCache(entry) {
  try {
    fs.mkdirSync(stateDir(), { recursive: true });
    let line;
    if (entry.kind === "UP_TO_DATE") {
      line = `UP_TO_DATE ${entry.local} ${entry.timestamp}`;
    } else if (entry.kind === "UPGRADE_AVAILABLE") {
      line = `UPGRADE_AVAILABLE ${entry.local} ${entry.remote} ${entry.timestamp}`;
    } else {
      return false;
    }
    fs.writeFileSync(lastCheckPath(), line + "\n", "utf-8");
    return true;
  } catch {
    return false;
  }
}

export function cacheFresh(entry, now = Date.now()) {
  if (!entry) return false;
  const ttl = entry.kind === "UP_TO_DATE" ? TTL_UP_TO_DATE_MS : TTL_UPGRADE_AVAILABLE_MS;
  return now - entry.timestamp < ttl;
}

// ── Snooze ───────────────────────────────────────────────────────────────────

export function readSnooze() {
  try {
    const raw = fs.readFileSync(snoozePath(), "utf-8").trim();
    if (!raw) return null;
    const parts = raw.split(/\s+/);
    if (parts.length < 3) return null;
    const [version, levelStr, tsStr] = parts;
    if (!isValidVersion(version)) return null;
    const level = parseInt(levelStr, 10);
    const ts = parseInt(tsStr, 10);
    if (!Number.isFinite(level) || !Number.isFinite(ts)) return null;
    return { version, level, timestamp: ts };
  } catch {
    return null;
  }
}

export function writeSnooze(entry) {
  try {
    fs.mkdirSync(stateDir(), { recursive: true });
    fs.writeFileSync(snoozePath(), `${entry.version} ${entry.level} ${entry.timestamp}\n`, "utf-8");
    return true;
  } catch {
    return false;
  }
}

export function clearSnooze() {
  try {
    fs.unlinkSync(snoozePath());
    return true;
  } catch {
    return false;
  }
}

/**
 * Increment the snooze level for the given remote version. Fresh snoozes
 * (or snoozes for a different version) start at level 1.
 */
export function bumpSnooze(remoteVersion, now = Date.now()) {
  const prior = readSnooze();
  let level = 1;
  if (prior && prior.version === remoteVersion) {
    level = Math.min(prior.level + 1, 3);
  }
  const entry = { version: remoteVersion, level, timestamp: now };
  writeSnooze(entry);
  return entry;
}

export function setSnooze(remoteVersion, level, now = Date.now()) {
  const clamped = Math.max(1, Math.min(Number(level) || 1, 3));
  const entry = { version: remoteVersion, level: clamped, timestamp: now };
  writeSnooze(entry);
  return entry;
}

/**
 * True if an active snooze matching `remoteVersion` is still in effect.
 * A snooze whose version differs from the current remote is ignored
 * (the user snoozed an older upgrade; the new one deserves a fresh nag).
 */
export function snoozeActive(remoteVersion, now = Date.now()) {
  const s = readSnooze();
  if (!s) return false;
  if (s.version !== remoteVersion) return false;
  return now - s.timestamp < snoozeDurationMs(s.level);
}

// ── just-upgraded-from ───────────────────────────────────────────────────────

export function readAndClearJustUpgraded() {
  try {
    const raw = fs.readFileSync(justUpgradedPath(), "utf-8").trim();
    try {
      fs.unlinkSync(justUpgradedPath());
    } catch {
      // Best-effort: losing the file is fine; we've already captured the value.
    }
    return isValidVersion(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function writeJustUpgraded(previousVersion) {
  try {
    if (!isValidVersion(previousVersion)) return false;
    fs.mkdirSync(stateDir(), { recursive: true });
    fs.writeFileSync(justUpgradedPath(), previousVersion + "\n", "utf-8");
    return true;
  } catch {
    return false;
  }
}

// ── Remote fetch ─────────────────────────────────────────────────────────────

/**
 * Fetch the remote package.json and return a semver string, or null on any
 * failure. Never throws.
 */
export function fetchRemoteVersion(url = remoteUrl(), timeoutMs = FETCH_TIMEOUT_MS) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (v) => {
      if (settled) return;
      settled = true;
      resolve(v);
    };

    const client = /^http:/i.test(url) ? http : https;
    let req;
    try {
      req = client.get(url, { timeout: timeoutMs }, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          done(null);
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          try {
            const body = Buffer.concat(chunks).toString("utf-8");
            const pkg = JSON.parse(body);
            const v = pkg?.version;
            done(isValidVersion(v) ? v : null);
          } catch {
            done(null);
          }
        });
        res.on("error", () => done(null));
      });
    } catch {
      done(null);
      return;
    }

    req.on("timeout", () => {
      req.destroy();
      done(null);
    });
    req.on("error", () => done(null));
  });
}

// ── Composition: cache-or-fetch ──────────────────────────────────────────────

/**
 * Return the cached entry if fresh, otherwise fetch, write, return.
 * Never throws; returns null if both paths fail.
 */
export async function refreshIfStale(localVersion, now = Date.now()) {
  const cached = readCache();

  // If the cached entry's local version is out of date vs. the binary we're
  // running, the cache is lying about "up to date" — drop it.
  const localMatches = cached && cached.local === localVersion;

  if (cached && localMatches && cacheFresh(cached, now)) return cached;

  const remote = await fetchRemoteVersion();
  if (!isValidVersion(remote) || !isValidVersion(localVersion)) {
    // Network failed; fall back to stale cache rather than silence if possible.
    return cached;
  }
  const cmp = compareVersions(remote, localVersion);
  const entry =
    cmp > 0
      ? { kind: "UPGRADE_AVAILABLE", local: localVersion, remote, timestamp: now }
      : { kind: "UP_TO_DATE", local: localVersion, timestamp: now };

  // Reset snooze if the remote version changed vs. the snooze's version.
  const s = readSnooze();
  if (s && entry.kind === "UPGRADE_AVAILABLE" && s.version !== entry.remote) {
    clearSnooze();
  }

  writeCache(entry);
  return entry;
}

// ── Top-level: check() → manifest marker ─────────────────────────────────────

/**
 * The single entry point used by the SessionStart hook. Returns a string
 * (one line, no trailing newline) or null if nothing should be surfaced.
 *
 * Options:
 *   localVersion  string   required. The VERSION of the running installer.
 *   enabled       boolean  default true. Pass `false` to skip entirely.
 *   now           number   override clock (for tests).
 */
export async function check({ localVersion, enabled = true, now = Date.now() } = {}) {
  try {
    // just-upgraded takes precedence: surfaces once, clears itself.
    const prev = readAndClearJustUpgraded();
    if (prev && isValidVersion(localVersion)) {
      return `[YP_JUST_UPGRADED ${prev} → ${localVersion}]`;
    }

    if (!enabled) return null;
    if (!isValidVersion(localVersion)) return null;

    const entry = await refreshIfStale(localVersion, now);
    if (!entry || entry.kind !== "UPGRADE_AVAILABLE") return null;

    if (snoozeActive(entry.remote, now)) return null;

    return `[YP_UPGRADE_AVAILABLE ${entry.local} ${entry.remote} · snooze: yp-stack snooze]`;
  } catch {
    // Absolute silent-fail contract.
    return null;
  }
}

// ── CLI ──────────────────────────────────────────────────────────────────────

/**
 * `yp-stack snooze [level|reset]`
 * - no arg           → bump snooze by one (levels 1→2→3 capped)
 * - <number>         → set explicit level (clamped to [1,3])
 * - reset | clear    → remove snooze file
 *
 * Requires an `UPGRADE_AVAILABLE` cache entry; otherwise prints a hint.
 */
export function runSnoozeCli(args) {
  const [sub] = args;
  if (sub === "reset" || sub === "clear") {
    const ok = clearSnooze();
    process.stdout.write(ok ? "snooze cleared\n" : "no snooze active\n");
    return 0;
  }

  const cached = readCache();
  if (!cached || cached.kind !== "UPGRADE_AVAILABLE") {
    process.stdout.write(
      "no upgrade pending — run session start to refresh, or `yp-stack` to install latest\n",
    );
    return 0;
  }

  let entry;
  if (sub === undefined) {
    entry = bumpSnooze(cached.remote);
  } else {
    const lvl = parseInt(sub, 10);
    if (!Number.isFinite(lvl)) {
      process.stderr.write(`Invalid level: ${sub}. Expected a number or 'reset'.\n`);
      return 1;
    }
    entry = setSnooze(cached.remote, lvl);
  }

  const hrs = Math.round(snoozeDurationMs(entry.level) / (60 * 60 * 1000));
  process.stdout.write(`snoozed ${entry.version} (level ${entry.level}, ~${hrs}h)\n`);
  return 0;
}
