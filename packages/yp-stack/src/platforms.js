import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const PLATFORMS = [
  {
    name: "Claude Code",
    value: "claude",
    skillPath: ".claude/skills",
    globalSkillPath: path.join(os.homedir(), ".claude", "skills"),
    globalGovernancePath: path.join(os.homedir(), ".agents"),
    detectPaths: [".claude"],
    hasIntegration: true,
  },
  {
    name: "Cursor",
    value: "cursor",
    skillPath: ".cursor/skills",
    globalSkillPath: path.join(os.homedir(), ".cursor", "skills"),
    globalGovernancePath: path.join(os.homedir(), ".agents"),
    detectPaths: [".cursor", ".cursorrules"],
    hasIntegration: false,
  },
  {
    name: "Windsurf",
    value: "windsurf",
    skillPath: ".codeium/windsurf/skills",
    globalSkillPath: path.join(os.homedir(), ".codeium", "windsurf", "skills"),
    globalGovernancePath: path.join(os.homedir(), ".agents"),
    detectPaths: [".codeium", ".windsurfrules"],
    hasIntegration: false,
  },
  {
    name: "GitHub Copilot",
    value: "copilot",
    skillPath: ".copilot/skills",
    globalSkillPath: path.join(os.homedir(), ".copilot", "skills"),
    globalGovernancePath: path.join(os.homedir(), ".agents"),
    detectPaths: [".copilot", ".github/copilot-instructions.md"],
    hasIntegration: false,
  },
  {
    name: "Cline",
    value: "cline",
    skillPath: ".cline/skills",
    globalSkillPath: path.join(os.homedir(), ".cline", "skills"),
    globalGovernancePath: path.join(os.homedir(), ".agents"),
    detectPaths: [".cline", ".clinerules"],
    hasIntegration: false,
  },
  {
    name: "Roo Code",
    value: "roo",
    skillPath: ".roo/skills",
    globalSkillPath: path.join(os.homedir(), ".roo", "skills"),
    globalGovernancePath: path.join(os.homedir(), ".agents"),
    detectPaths: [".roo", ".roorules"],
    hasIntegration: false,
  },
  {
    name: "OpenCode",
    value: "opencode",
    skillPath: ".opencode/skills",
    globalSkillPath: path.join(os.homedir(), ".opencode", "skills"),
    globalGovernancePath: path.join(os.homedir(), ".agents"),
    detectPaths: [".opencode"],
    hasIntegration: false,
  },
  {
    name: "Generic (.agents/)",
    value: "generic",
    skillPath: ".agents/skills",
    globalSkillPath: path.join(os.homedir(), ".agents", "skills"),
    globalGovernancePath: path.join(os.homedir(), ".agents"),
    detectPaths: [".agents"],
    hasIntegration: false,
  },
  {
    name: "Custom path",
    value: "custom",
    skillPath: null,
    globalSkillPath: null,
    globalGovernancePath: path.join(os.homedir(), ".agents"),
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
