/**
 * Host config type definition + validator.
 *
 * Each supported host (Claude Code, Cursor, Windsurf, ...) is defined as a
 * HostConfig object in src/hosts/<name>.js and registered in src/hosts/index.js.
 *
 * This file is the contract that lets future platform content diverge without
 * forking the installer: a new host = a new file implementing HostConfig.
 *
 * Ported (trimmed) from gstack's scripts/host-config.ts — yellowpages doesn't
 * need frontmatter transforms, content rewrites, or sidecar support yet, so we
 * keep the surface area small and grow it as divergence materializes.
 */

/**
 * @typedef {Object} HostConfig
 * @property {string} name
 *   Unique host identifier (e.g. 'claude'). Must match filename in hosts/.
 * @property {string} displayName
 *   Human-readable name for UI/logs (e.g. 'Claude Code').
 * @property {string|null} skillPath
 *   Project-relative skills dir (e.g. '.claude/skills'). null = runtime-entered.
 * @property {string|null} globalSkillPath
 *   Absolute global skills dir (e.g. ~/.claude/skills). null = not supported.
 * @property {string} globalGovernancePath
 *   Absolute path to the governance dir (currently always ~/.agents).
 * @property {string[]} detectPaths
 *   Path fragments (project- or home-relative) whose existence signals the host
 *   is in use. Match any of these = platform detected.
 * @property {boolean} hasIntegration
 *   Whether yp-stack installs a SessionStart / PreToolUse hook for this host.
 *   Only Claude Code is true today.
 * @property {boolean} hasCommandsSupport
 *   Whether the host supports slash-command wrapper files (e.g. Claude's
 *   ~/.claude/commands/*.md discoverability surface).
 * @property {string|null} commandsSubdir
 *   Path (project- or home-relative) where command wrappers live. null iff
 *   hasCommandsSupport === false.
 */

const NAME_REGEX = /^[a-z][a-z0-9-]*$/;

/**
 * Validate a single HostConfig. Returns array of error strings (empty = ok).
 * @param {HostConfig} config
 * @returns {string[]}
 */
export function validateHostConfig(config) {
  const errors = [];
  if (!config || typeof config !== "object") {
    return ["config must be an object"];
  }
  if (!NAME_REGEX.test(config.name ?? "")) {
    errors.push(`name '${config.name}' must be lowercase alphanumeric with hyphens`);
  }
  if (!config.displayName) {
    errors.push("displayName is required");
  }
  if (!Array.isArray(config.detectPaths)) {
    errors.push("detectPaths must be an array");
  }
  if (typeof config.hasIntegration !== "boolean") {
    errors.push("hasIntegration must be a boolean");
  }
  if (typeof config.hasCommandsSupport !== "boolean") {
    errors.push("hasCommandsSupport must be a boolean");
  }
  if (config.hasCommandsSupport && !config.commandsSubdir) {
    errors.push("commandsSubdir required when hasCommandsSupport is true");
  }
  if (!config.hasCommandsSupport && config.commandsSubdir) {
    errors.push("commandsSubdir must be null when hasCommandsSupport is false");
  }
  return errors;
}

/**
 * Validate an array of HostConfigs — checks each config plus cross-config
 * uniqueness (duplicate names).
 * @param {HostConfig[]} configs
 * @returns {string[]}
 */
export function validateAllHostConfigs(configs) {
  const errors = [];
  const seen = new Map();
  for (const c of configs) {
    const perErrors = validateHostConfig(c);
    errors.push(...perErrors.map((e) => `[${c?.name ?? "?"}] ${e}`));
    if (c?.name) {
      if (seen.has(c.name)) errors.push(`duplicate host name '${c.name}'`);
      seen.set(c.name, true);
    }
  }
  return errors;
}
