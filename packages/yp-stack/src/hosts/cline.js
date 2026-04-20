import os from "node:os";
import path from "node:path";

/** @type {import('./_host-config.js').HostConfig} */
const cline = {
  name: "cline",
  displayName: "Cline",
  skillPath: ".cline/skills",
  globalSkillPath: path.join(os.homedir(), ".cline", "skills"),
  globalGovernancePath: path.join(os.homedir(), ".agents"),
  detectPaths: [".cline", ".clinerules"],
  hasIntegration: false,
  hasCommandsSupport: false,
  commandsSubdir: null,
};

export default cline;
