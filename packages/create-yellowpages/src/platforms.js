import fs from 'node:fs';
import path from 'node:path';

export const PLATFORMS = [
  {
    name: 'Claude Code',
    value: 'claude',
    skillPath: '.claude/skills',
    detectPaths: ['.claude'],
    hasIntegration: true,
  },
  {
    name: 'Cursor',
    value: 'cursor',
    skillPath: '.cursor/skills',
    detectPaths: ['.cursor', '.cursorrules'],
    hasIntegration: false,
  },
  {
    name: 'Windsurf',
    value: 'windsurf',
    skillPath: '.codeium/windsurf/skills',
    detectPaths: ['.codeium', '.windsurfrules'],
    hasIntegration: false,
  },
  {
    name: 'GitHub Copilot',
    value: 'copilot',
    skillPath: '.copilot/skills',
    detectPaths: ['.copilot', '.github/copilot-instructions.md'],
    hasIntegration: false,
  },
  {
    name: 'Cline',
    value: 'cline',
    skillPath: '.cline/skills',
    detectPaths: ['.cline', '.clinerules'],
    hasIntegration: false,
  },
  {
    name: 'Roo Code',
    value: 'roo',
    skillPath: '.roo/skills',
    detectPaths: ['.roo', '.roorules'],
    hasIntegration: false,
  },
  {
    name: 'OpenCode',
    value: 'opencode',
    skillPath: '.opencode/skills',
    detectPaths: ['.opencode'],
    hasIntegration: false,
  },
  {
    name: 'Generic (.agents/)',
    value: 'generic',
    skillPath: '.agents/skills',
    detectPaths: ['.agents'],
    hasIntegration: false,
  },
  {
    name: 'Custom path',
    value: 'custom',
    skillPath: null,
    detectPaths: [],
    hasIntegration: false,
  },
];

export function detectPlatforms(cwd) {
  const detected = [];
  for (const platform of PLATFORMS) {
    for (const dp of platform.detectPaths) {
      if (fs.existsSync(path.join(cwd, dp))) {
        detected.push(platform.value);
        break;
      }
    }
  }
  return detected;
}

export function getPlatform(value) {
  return PLATFORMS.find((p) => p.value === value);
}
