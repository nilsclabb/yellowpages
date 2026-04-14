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

const YP_COMMAND_MARKER = "<!-- yp-stack:generated -->";

/**
 * Parse frontmatter fields from a SKILL.md content string.
 * Handles both inline values and YAML folded-block `>` multiline.
 * Returns { name, description, command, argumentHint } or null.
 */
function parseBundledFrontmatter(content) {
  const match = /^---\n([\s\S]*?)\n---/.exec(content);
  if (!match) return null;
  const yaml = match[1];
  const get = (key) => {
    const re = new RegExp(`^${key}:\\s*(.+)$`, "m");
    const m = re.exec(yaml);
    if (!m) return null;
    const val = m[1].trim();
    // Handle YAML folded-block scalar (description: >)
    if (val === ">" || val === "|") {
      const afterKey = yaml.slice(m.index + m[0].length);
      const lines = afterKey.split("\n");
      const indented = [];
      for (const line of lines) {
        if (/^\s+\S/.test(line)) {
          indented.push(line.trim());
        } else if (indented.length > 0) {
          break;
        }
      }
      return indented.join(" ") || null;
    }
    return val.replace(/^["']|["']$/g, "");
  };
  return {
    name: get("name"),
    description: get("description"),
    command: get("command"),
    argumentHint: get("argumentHint"),
  };
}

/**
 * Generate thin command wrapper files for slash command discoverability.
 *
 * Reads `command` field from each SKILL.md frontmatter in the bundle and
 * creates a corresponding .md file in the commands directory. Apps like
 * t3code discover commands via initializationResult().commands, which reads
 * from ~/.claude/commands/ (user commands → /user:<name>).
 *
 * Each generated file is marked with <!-- yp-stack:generated --> so cleanup
 * can remove them without touching user-created commands.
 *
 * @param {string} commandsPathAbsolute  Absolute path to commands dir (e.g. ~/.claude/commands)
 * @returns {string[]}  List of created command file paths
 */
export function createCommandFiles(commandsPathAbsolute) {
  const created = [];

  for (const key of SKILL_KEYS) {
    const m = key.match(/^skills\/yellowpages\/([^/]+)\/SKILL\.md$/);
    if (!m) continue;

    const skillName = m[1];
    const fm = parseBundledFrontmatter(FILES[key]);
    if (!fm || !fm.command) continue;

    let frontmatter = `---\ndescription: ${fm.description || skillName}\n`;
    if (fm.argumentHint) {
      frontmatter += `argument-hint: ${fm.argumentHint}\n`;
    }
    frontmatter += "---\n";

    const body = `${YP_COMMAND_MARKER}\nRun the ${skillName} skill. $ARGUMENTS\n`;

    const dest = path.join(commandsPathAbsolute, `${skillName}.md`);
    fs.mkdirSync(commandsPathAbsolute, { recursive: true });
    fs.writeFileSync(dest, frontmatter + body, "utf-8");
    created.push(dest);
  }

  return created;
}

/**
 * Remove yp-stack-generated command files (identified by marker comment).
 * Leaves user-created command files untouched.
 *
 * @param {string} commandsPathAbsolute  Absolute path to commands dir
 */
export function cleanCommandFiles(commandsPathAbsolute) {
  try {
    for (const entry of fs.readdirSync(commandsPathAbsolute)) {
      if (!entry.endsWith(".md")) continue;
      const filePath = path.join(commandsPathAbsolute, entry);
      try {
        const content = fs.readFileSync(filePath, "utf-8");
        if (content.includes(YP_COMMAND_MARKER)) {
          fs.unlinkSync(filePath);
        }
      } catch {}
    }
  } catch {}
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
 * @param {string|null} [options.commandsPathAbsolute]  Absolute path to commands dir (e.g. ~/.claude/commands). When provided, generates thin command wrappers for slash command discoverability.
 * @param {((absPath: string, status: 'created'|'skipped') => void) | null} [onFile]
 *   Called immediately after each file write with the absolute path and status.
 *   Callers should apply displayPath() before rendering to terminal.
 *   Does NOT fire for learnings.jsonl (handled separately after the main loops).
 * @returns {{ created: string[], skipped: string[] }}
 */
export function installFiles(
  {
    skillPathAbsolute,
    governancePath,
    scope,
    projectType,
    stateTracking,
    commandsPathAbsolute = null,
  },
  onFile = null,
) {
  const nonDestructive = projectType === "existing" || projectType === "monorepo";
  const { skillKeys, governanceKeys } = resolveFileList(scope, stateTracking);

  // Clean previous install for fresh installs (removes stale files from old versions)
  if (!nonDestructive) {
    cleanPreviousInstall(skillPathAbsolute);
    if (commandsPathAbsolute) cleanCommandFiles(commandsPathAbsolute);
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

  // Generate thin command wrappers for slash command discoverability (t3code, etc.)
  if (commandsPathAbsolute && scope !== "minimal") {
    const cmdFiles = createCommandFiles(commandsPathAbsolute);
    created.push(...cmdFiles);
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
