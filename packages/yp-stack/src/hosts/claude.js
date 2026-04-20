import os from "node:os";
import path from "node:path";

/** @type {import('./_host-config.js').HostConfig} */
const claude = {
  name: "claude",
  displayName: "Claude Code",
  skillPath: ".claude/skills",
  globalSkillPath: path.join(os.homedir(), ".claude", "skills"),
  globalGovernancePath: path.join(os.homedir(), ".agents"),
  detectPaths: [".claude"],
  hasIntegration: true,
  hasCommandsSupport: true,
  commandsSubdir: ".claude/commands",
};

export default claude;
