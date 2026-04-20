import os from "node:os";
import path from "node:path";

/** @type {import('./_host-config.js').HostConfig} */
const opencode = {
  name: "opencode",
  displayName: "OpenCode",
  skillPath: ".opencode/skills",
  globalSkillPath: path.join(os.homedir(), ".opencode", "skills"),
  globalGovernancePath: path.join(os.homedir(), ".agents"),
  detectPaths: [".opencode"],
  hasIntegration: false,
  hasCommandsSupport: false,
  commandsSubdir: null,
};

export default opencode;
