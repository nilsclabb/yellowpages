import os from "node:os";
import path from "node:path";

/** @type {import('./_host-config.js').HostConfig} */
const copilot = {
  name: "copilot",
  displayName: "GitHub Copilot",
  skillPath: ".copilot/skills",
  globalSkillPath: path.join(os.homedir(), ".copilot", "skills"),
  globalGovernancePath: path.join(os.homedir(), ".agents"),
  detectPaths: [".copilot", ".github/copilot-instructions.md"],
  hasIntegration: false,
  hasCommandsSupport: false,
  commandsSubdir: null,
};

export default copilot;
