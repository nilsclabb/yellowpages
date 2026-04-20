import os from "node:os";
import path from "node:path";

/** @type {import('./_host-config.js').HostConfig} */
const windsurf = {
  name: "windsurf",
  displayName: "Windsurf",
  skillPath: ".codeium/windsurf/skills",
  globalSkillPath: path.join(os.homedir(), ".codeium", "windsurf", "skills"),
  globalGovernancePath: path.join(os.homedir(), ".agents"),
  detectPaths: [".codeium", ".windsurfrules"],
  hasIntegration: false,
  hasCommandsSupport: false,
  commandsSubdir: null,
};

export default windsurf;
