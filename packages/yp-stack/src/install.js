import fs from "node:fs";
import path from "node:path";
import { FILES } from "./content.js";
import { VERSION } from "./hooks.js";

const SKILL_PREFIX = "skills/yellowpages/";

const SKILL_KEYS = Object.keys(FILES).filter((k) => k.startsWith(SKILL_PREFIX));
const GOVERNANCE_KEYS = Object.keys(FILES).filter((k) => !k.startsWith(SKILL_PREFIX));

/**
 * Detect sub-skill directory names from the bundle.
 * A sub-skill is any directory inside skills/yellowpages/ that contains a SKILL.md.
 */
const SUB_SKILLS = [
  ...new Set(
    SKILL_KEYS.filter((k) => {
      const tail = k.slice(SKILL_PREFIX.length);
      // Must be <name>/SKILL.md (one level deep, not the root SKILL.md)
      return tail.includes("/") && tail.endsWith("/SKILL.md") && tail.split("/").length === 2;
    }).map((k) => k.slice(SKILL_PREFIX.length).split("/")[0]),
  ),
];

function resolveFileList(scope, stateTracking) {
  let skillKeys;
  let governanceKeys;

  switch (scope) {
    case "full":
      skillKeys = [...SKILL_KEYS];
      governanceKeys = [...GOVERNANCE_KEYS];
      break;
    case "skill":
      skillKeys = [...SKILL_KEYS];
      governanceKeys = [];
      break;
    case "minimal":
      skillKeys = SKILL_KEYS.filter((k) => k === `${SKILL_PREFIX}SKILL.md`);
      governanceKeys = [];
      break;
    default:
      skillKeys = [...SKILL_KEYS];
      governanceKeys = [];
  }

  if (stateTracking && !governanceKeys.includes("state/README.md")) {
    if (FILES["state/README.md"]) {
      governanceKeys.push("state/README.md");
    }
  }

  return { skillKeys, governanceKeys };
}

function safeWrite(absolutePath, content, nonDestructive) {
  if (nonDestructive && fs.existsSync(absolutePath)) {
    return "skipped";
  }
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content, "utf-8");
  return "created";
}

/**
 * Clean up previous yellowpages installation.
 *
 * Removes the yellowpages/ package directory and any top-level symlinks
 * that point into it. Ensures a fresh install with no stale files from
 * previous versions (removed skills, renamed files, etc.).
 *
 * @param {string} skillPathAbsolute  Absolute path to skills dir
 */
export function cleanPreviousInstall(skillPathAbsolute) {
  const ypDir = path.join(skillPathAbsolute, "yellowpages");

  // Remove top-level symlinks that point into yellowpages/
  try {
    for (const entry of fs.readdirSync(skillPathAbsolute)) {
      const entryPath = path.join(skillPathAbsolute, entry);
      try {
        const stat = fs.lstatSync(entryPath);
        if (stat.isSymbolicLink()) {
          const target = fs.readlinkSync(entryPath);
          // Remove if symlink points into yellowpages/ (absolute or relative)
          if (target.includes("yellowpages/") || target.includes("yellowpages\\")) {
            fs.unlinkSync(entryPath);
          }
        }
      } catch {}
    }
  } catch {}

  // Remove the yellowpages package directory
  try {
    fs.rmSync(ypDir, { recursive: true, force: true });
  } catch {}
}

/**
 * Create top-level symlinks for each sub-skill so platform skill discovery
 * (e.g. Claude Code's Skill tool) can find them individually.
 *
 * Creates: <skillPath>/<sub-skill> → <skillPath>/yellowpages/<sub-skill>
 *
 * @param {string} skillPathAbsolute  Absolute path to skills dir
 * @returns {string[]}  List of created symlink paths
 */
export function createSkillSymlinks(skillPathAbsolute) {
  const ypDir = path.join(skillPathAbsolute, "yellowpages");
  const created = [];

  for (const name of SUB_SKILLS) {
    const source = path.join(ypDir, name);
    const link = path.join(skillPathAbsolute, name);

    // Skip if source doesn't exist (minimal scope)
    if (!fs.existsSync(source)) continue;

    // Remove existing entry at link path (stale symlink, dir, etc.)
    try {
      const stat = fs.lstatSync(link);
      if (stat.isSymbolicLink() || stat.isDirectory()) {
        fs.rmSync(link, { recursive: true, force: true });
      }
    } catch {}

    try {
      // Use relative symlink for portability
      const relative = path.relative(skillPathAbsolute, source);
      fs.symlinkSync(relative, link);
      created.push(link);
    } catch {}
  }

  return created;
}

/**
 * Install yellowpages files.
 *
 * For fresh installs (projectType "new" or "global"), cleans the previous
 * installation first to remove stale files from older versions.
 *
 * After writing skill files, creates top-level symlinks for each sub-skill
 * so platform skill discovery can find them individually.
 *
 * @param {Object} options
 * @param {string} options.skillPathAbsolute   Absolute path to skills dir (e.g. /Users/x/.claude/skills)
 * @param {string} options.governancePath      Absolute path to .agents dir
 * @param {'full'|'skill'|'minimal'} options.scope
 * @param {'new'|'existing'|'monorepo'|'global'} options.projectType
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
  const nonDestructive = projectType === "existing" || projectType === "monorepo";
  const { skillKeys, governanceKeys } = resolveFileList(scope, stateTracking);

  // Clean previous install for fresh installs (removes stale files from old versions)
  if (!nonDestructive) {
    cleanPreviousInstall(skillPathAbsolute);
  }

  const created = [];
  const skipped = [];

  // Skill files → <skillPathAbsolute>/yellowpages/...
  for (const key of skillKeys) {
    const tail = key.slice(SKILL_PREFIX.length);
    const dest = path.join(skillPathAbsolute, "yellowpages", tail);
    const status = safeWrite(dest, FILES[key], nonDestructive);
    (status === "created" ? created : skipped).push(dest);
    if (onFile) onFile(dest, status);
  }

  // Write version marker (used by skills-manifest hook when no config exists)
  const versionMarker = path.join(skillPathAbsolute, "yellowpages", ".yp-version");
  fs.mkdirSync(path.dirname(versionMarker), { recursive: true });
  fs.writeFileSync(versionMarker, JSON.stringify({ version: VERSION }) + "\n", "utf-8");

  // Create top-level symlinks for sub-skill discoverability
  if (scope !== "minimal") {
    const symlinks = createSkillSymlinks(skillPathAbsolute);
    created.push(...symlinks);
  }

  // Governance files → <governancePath>/...
  for (const key of governanceKeys) {
    const dest = path.join(governancePath, key);
    const status = safeWrite(dest, FILES[key], nonDestructive);
    (status === "created" ? created : skipped).push(dest);
    if (onFile) onFile(dest, status);
  }

  // Create empty learnings.jsonl if state tracking enabled.
  // Does NOT call onFile — appears in Act 3 count summary only.
  if (stateTracking) {
    const learningsPath = path.join(governancePath, "state", "learnings.jsonl");
    if (!fs.existsSync(learningsPath)) {
      fs.mkdirSync(path.dirname(learningsPath), { recursive: true });
      fs.writeFileSync(learningsPath, "", "utf-8");
      created.push(learningsPath);
    } else {
      skipped.push(learningsPath);
    }
  }

  return { created, skipped };
}

/**
 * Write yellowpages.config.json.
 */
export function writeConfig(rootDir, config) {
  const dest = path.join(rootDir, "yellowpages.config.json");
  fs.writeFileSync(dest, JSON.stringify(config, null, 2) + "\n", "utf-8");
}

/**
 * Append a yellowpages instruction block to a platform instructions file (e.g. CLAUDE.md).
 * Skips if the marker is already present.
 */
export function appendToInstructions(rootDir, filename) {
  const filePath = path.join(rootDir, filename);
  const marker = "<!-- yellowpages:start -->";
  const block = `
${marker}
## Skills

This project uses the [yellowpages](https://github.com/nilsclabb/yellowpages) skill system.

- Skill definitions: \`.claude/skills/yellowpages/\`
- Governance (workflows, checklists, agents): \`.agents/\`
- Session start: read \`.agents/project-context.md\`, then \`.agents/ETHOS.md\`, then check \`skills/yellowpages/INDEX.md\`
<!-- yellowpages:end -->
`;

  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, "utf-8");
    if (existing.includes(marker)) return;
    fs.appendFileSync(filePath, block, "utf-8");
  } else {
    fs.writeFileSync(filePath, block.trimStart(), "utf-8");
  }
}
