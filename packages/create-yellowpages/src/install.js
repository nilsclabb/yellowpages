import fs from 'node:fs';
import path from 'node:path';
import { FILES } from './content.js';

const SKILL_PREFIX = 'skills/yellowpages/';

const SKILL_KEYS = Object.keys(FILES).filter((k) => k.startsWith(SKILL_PREFIX));
const GOVERNANCE_KEYS = Object.keys(FILES).filter((k) => !k.startsWith(SKILL_PREFIX));

function resolveFileList(scope, stateTracking) {
  let skillKeys;
  let governanceKeys;

  switch (scope) {
    case 'full':
      skillKeys = [...SKILL_KEYS];
      governanceKeys = [...GOVERNANCE_KEYS];
      break;
    case 'skill':
      skillKeys = [...SKILL_KEYS];
      governanceKeys = [];
      break;
    case 'minimal':
      skillKeys = SKILL_KEYS.filter((k) => k === `${SKILL_PREFIX}SKILL.md`);
      governanceKeys = [];
      break;
    default:
      skillKeys = [...SKILL_KEYS];
      governanceKeys = [];
  }

  if (stateTracking && !governanceKeys.includes('state/README.md')) {
    if (FILES['state/README.md']) {
      governanceKeys.push('state/README.md');
    }
  }

  return { skillKeys, governanceKeys };
}

function safeWrite(absolutePath, content, nonDestructive) {
  if (nonDestructive && fs.existsSync(absolutePath)) {
    return 'skipped';
  }
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content, 'utf-8');
  return 'created';
}

/**
 * Install yellowpages files to the target project.
 *
 * @param {Object} options
 * @param {string} options.rootDir       Absolute path to project root
 * @param {string} options.skillPath     Relative path to skills dir (e.g. '.claude/skills')
 * @param {'full'|'skill'|'minimal'} options.scope
 * @param {'new'|'existing'|'monorepo'} options.projectType
 * @param {boolean} options.stateTracking
 * @returns {{ created: string[], skipped: string[] }}
 */
export function installFiles({ rootDir, skillPath, scope, projectType, stateTracking }) {
  const nonDestructive = projectType === 'existing' || projectType === 'monorepo';
  const { skillKeys, governanceKeys } = resolveFileList(scope, stateTracking);

  const created = [];
  const skipped = [];

  // Skill files → <rootDir>/<skillPath>/yellowpages/...
  for (const key of skillKeys) {
    const tail = key.slice(SKILL_PREFIX.length);
    const dest = path.join(rootDir, skillPath, 'yellowpages', tail);
    const status = safeWrite(dest, FILES[key], nonDestructive);
    const display = path.relative(rootDir, dest);
    (status === 'created' ? created : skipped).push(display);
  }

  // Governance files → <rootDir>/.agents/...
  for (const key of governanceKeys) {
    const dest = path.join(rootDir, '.agents', key);
    const status = safeWrite(dest, FILES[key], nonDestructive);
    const display = path.relative(rootDir, dest);
    (status === 'created' ? created : skipped).push(display);
  }

  // Create empty learnings.jsonl if state tracking enabled
  if (stateTracking) {
    const learningsPath = path.join(rootDir, '.agents', 'state', 'learnings.jsonl');
    if (!fs.existsSync(learningsPath)) {
      fs.mkdirSync(path.dirname(learningsPath), { recursive: true });
      fs.writeFileSync(learningsPath, '', 'utf-8');
      created.push('.agents/state/learnings.jsonl');
    } else {
      skipped.push('.agents/state/learnings.jsonl');
    }
  }

  return { created, skipped };
}

/**
 * Write yellowpages.config.json.
 */
export function writeConfig(rootDir, config) {
  const dest = path.join(rootDir, 'yellowpages.config.json');
  fs.writeFileSync(dest, JSON.stringify(config, null, 2) + '\n', 'utf-8');
}

/**
 * Append a yellowpages instruction block to a platform instructions file (e.g. CLAUDE.md).
 * Skips if the marker is already present.
 */
export function appendToInstructions(rootDir, filename) {
  const filePath = path.join(rootDir, filename);
  const marker = '<!-- yellowpages:start -->';
  const block = `
${marker}
## Skills

This project uses the [yellowpages](https://github.com/codewithnils/yellowpages) skill system.

- Skill definitions: \`.claude/skills/yellowpages/\`
- Governance (workflows, checklists, agents): \`.agents/\`
- Session start: read \`.agents/project-context.md\`, then \`.agents/ETHOS.md\`, then check \`.agents/skills/yellowpages/INDEX.md\`
<!-- yellowpages:end -->
`;

  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf-8');
    if (existing.includes(marker)) return;
    fs.appendFileSync(filePath, block, 'utf-8');
  } else {
    fs.writeFileSync(filePath, block.trimStart(), 'utf-8');
  }
}
