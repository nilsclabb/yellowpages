/**
 * Backwards-compat shim over src/hosts/.
 *
 * Phase 4 migrated the PLATFORMS array into per-host configs at src/hosts/*.js
 * with a registry at src/hosts/index.js. This file preserves the original
 * `PLATFORMS` / `detectPlatforms` / `getPlatform` API so existing call sites
 * (index.js, skills-manager.js, bin/cli.js, test/install.test.js) keep working.
 *
 * New code should import from "./hosts/index.js" directly — the `value` /
 * `name` field split here exists only for the legacy call sites.
 *
 * Remove this shim once no caller references it.
 */

import { ALL_HOSTS, detectHosts, getHost } from "./hosts/index.js";

/** Legacy shape: `value` = host.name, `name` = host.displayName. */
export const PLATFORMS = ALL_HOSTS.map((h) => ({
  name: h.displayName,
  value: h.name,
  skillPath: h.skillPath,
  globalSkillPath: h.globalSkillPath,
  globalGovernancePath: h.globalGovernancePath,
  detectPaths: h.detectPaths,
  hasIntegration: h.hasIntegration,
  hasCommandsSupport: h.hasCommandsSupport,
  commandsSubdir: h.commandsSubdir,
}));

export function detectPlatforms(cwd) {
  return detectHosts(cwd);
}

export function getPlatform(value) {
  const host = getHost(value);
  if (!host) return undefined;
  return PLATFORMS.find((p) => p.value === value);
}
