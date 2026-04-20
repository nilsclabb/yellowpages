import os from "node:os";
import path from "node:path";

/** @type {import('./_host-config.js').HostConfig} */
const generic = {
  name: "generic",
  displayName: "Generic (.agents/)",
  skillPath: ".agents/skills",
  globalSkillPath: path.join(os.homedir(), ".agents", "skills"),
  globalGovernancePath: path.join(os.homedir(), ".agents"),
  detectPaths: [".agents"],
  hasIntegration: false,
  hasCommandsSupport: false,
  commandsSubdir: null,
};

export default generic;
