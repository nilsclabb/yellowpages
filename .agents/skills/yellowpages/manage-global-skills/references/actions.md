# Manage Global — Actions Reference

## [1] Install a skill

Ask: "Where is the skill? (a) npm package  (b) git URL  (c) local path"
See `sources.md` for how to handle each source type.
After install: run `/validate skill ~/.claude/skills/<name>` to confirm compliance.

## [2] Remove a skill

1. Ask which skill to remove (show numbered list of non-yellowpages skills)
2. Confirm: "Remove ~/.claude/skills/<name>? This deletes all files. [yes/no]"
3. On yes: `rm -rf ~/.claude/skills/<name>`
4. Confirm removal: `ls ~/.claude/skills/<name>` → "No such file or directory"

Never remove yellowpages core skills without explicit user instruction.

## [3] Update yellowpages

Run: `npx yp-stack` — the interactive installer handles version detection and updates.
If `yellowpages.config.json` exists in cwd, the installer will use its stored platform/scope settings.

## [4] View skill details

Ask which skill to view. Read and display its `SKILL.md`.
