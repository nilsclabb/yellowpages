/**
 * Host config registry.
 *
 * Single source of truth for per-host installer behavior. Each host is one
 * file in this directory, imported + registered in ALL_HOSTS below.
 *
 * Adding a new host:
 *   1. Copy src/hosts/generic.js → src/hosts/<name>.js
 *   2. Edit the config for the new platform
 *   3. Import + append to ALL_HOSTS here
 *   4. `npm test` — hosts.test.js validates the registry
 *
 * Mirrors gstack's hosts/index.ts derived-union pattern. Yellowpages stays in
 * plain JS (JSDoc-typed) per the spec — no TypeScript build step needed.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { validateAllHostConfigs } from "./_host-config.js";
import claude from "./claude.js";
import cursor from "./cursor.js";
import windsurf from "./windsurf.js";
import copilot from "./copilot.js";
import cline from "./cline.js";
import roo from "./roo.js";
import opencode from "./opencode.js";
import generic from "./generic.js";
import custom from "./custom.js";

/** @type {import('./_host-config.js').HostConfig[]} */
export const ALL_HOSTS = [claude, cursor, windsurf, copilot, cline, roo, opencode, generic, custom];

/** @type {Record<string, import('./_host-config.js').HostConfig>} */
export const HOST_MAP = Object.fromEntries(ALL_HOSTS.map((h) => [h.name, h]));

/** Canonical host name list — usable for CLI arg validation. */
export const HOST_NAMES = ALL_HOSTS.map((h) => h.name);

// Fail loudly on boot if the registry itself is malformed.
{
  const errors = validateAllHostConfigs(ALL_HOSTS);
  if (errors.length) {
    throw new Error(`Invalid host registry:\n  - ${errors.join("\n  - ")}`);
  }
}

/**
 * Lookup by name. Returns undefined if not found.
 * @param {string} name
 * @returns {import('./_host-config.js').HostConfig|undefined}
 */
export function getHost(name) {
  return HOST_MAP[name];
}

/**
 * Detect installed hosts in a given cwd (checks both project and $HOME).
 * @param {string} cwd
 * @returns {string[]} host names, in registry order
 */
export function detectHosts(cwd) {
  const detected = [];
  const home = os.homedir();
  for (const host of ALL_HOSTS) {
    for (const dp of host.detectPaths) {
      if (fs.existsSync(path.join(cwd, dp)) || fs.existsSync(path.join(home, dp))) {
        detected.push(host.name);
        break;
      }
    }
  }
  return detected;
}

// Re-export individual host configs for direct consumers.
export { claude, cursor, windsurf, copilot, cline, roo, opencode, generic, custom };
