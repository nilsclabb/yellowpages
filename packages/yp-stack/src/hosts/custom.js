import os from "node:os";
import path from "node:path";

/** @type {import('./_host-config.js').HostConfig} */
const custom = {
  name: "custom",
  displayName: "Custom path",
  skillPath: null,
  globalSkillPath: null,
  globalGovernancePath: path.join(os.homedir(), ".agents"),
  detectPaths: [],
  hasIntegration: false,
  hasCommandsSupport: false,
  commandsSubdir: null,
};

export default custom;
