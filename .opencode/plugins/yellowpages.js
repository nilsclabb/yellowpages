/**
 * Yellowpages plugin for OpenCode.
 *
 * Registers the skill library and injects only the using-yellowpages bootstrap
 * into the first user message. All other skills stay lazy-loaded.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function stripFrontmatter(content) {
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return match ? match[1] : content;
}

function normalizePath(value, homeDir) {
  if (!value || typeof value !== "string") return null;
  if (value === "~") return homeDir;
  if (value.startsWith("~/")) return path.join(homeDir, value.slice(2));
  return path.resolve(value);
}

export const YellowpagesPlugin = async () => {
  const homeDir = os.homedir();
  const skillsDir = path.resolve(__dirname, "../../skills/yellowpages");
  const envConfigDir = normalizePath(process.env.OPENCODE_CONFIG_DIR, homeDir);
  const configDir = envConfigDir || path.join(homeDir, ".config", "opencode");

  function bootstrapContent() {
    const bootstrapPath = path.join(skillsDir, "using-yellowpages", "SKILL.md");
    if (!fs.existsSync(bootstrapPath)) return null;
    const content = stripFrontmatter(fs.readFileSync(bootstrapPath, "utf8"));
    return `<YELLOWPAGES_BOOTSTRAP>
You have yellowpages.

Only the using-yellowpages bootstrap is already loaded. Use OpenCode's native skill tool for all other yellowpages skills.

${content}

OpenCode tool mapping:
- TodoWrite -> todowrite
- Skill tool -> native skill tool
- File and shell tools -> native OpenCode tools

Skill path registered from plugin: ${skillsDir}
Config dir: ${configDir}
</YELLOWPAGES_BOOTSTRAP>`;
  }

  return {
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir);
      }
    },

    "experimental.chat.messages.transform": async (_input, output) => {
      const bootstrap = bootstrapContent();
      if (!bootstrap || !output.messages.length) return;
      const firstUser = output.messages.find((message) => message.info.role === "user");
      if (!firstUser || !firstUser.parts.length) return;
      if (
        firstUser.parts.some(
          (part) => part.type === "text" && part.text.includes("YELLOWPAGES_BOOTSTRAP"),
        )
      ) {
        return;
      }
      const ref = firstUser.parts[0];
      firstUser.parts.unshift({ ...ref, type: "text", text: bootstrap });
    },
  };
};
