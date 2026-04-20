import os from "node:os";
import path from "node:path";

/** @type {import('./_host-config.js').HostConfig} */
const cursor = {
  name: "cursor",
  displayName: "Cursor",
  skillPath: ".cursor/skills",
  globalSkillPath: path.join(os.homedir(), ".cursor", "skills"),
  globalGovernancePath: path.join(os.homedir(), ".agents"),
  detectPaths: [".cursor", ".cursorrules"],
  hasIntegration: false,
  hasCommandsSupport: false,
  commandsSubdir: null,
};

export default cursor;
