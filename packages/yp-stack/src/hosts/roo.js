import os from "node:os";
import path from "node:path";

/** @type {import('./_host-config.js').HostConfig} */
const roo = {
  name: "roo",
  displayName: "Roo Code",
  skillPath: ".roo/skills",
  globalSkillPath: path.join(os.homedir(), ".roo", "skills"),
  globalGovernancePath: path.join(os.homedir(), ".agents"),
  detectPaths: [".roo", ".roorules"],
  hasIntegration: false,
  hasCommandsSupport: false,
  commandsSubdir: null,
};

export default roo;
