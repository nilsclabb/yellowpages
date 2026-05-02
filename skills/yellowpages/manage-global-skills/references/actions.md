# Manage Global — Actions Reference

## [1] Install a skill

Ask: "Where is the skill? (a) native plugin  (b) git URL  (c) local path"
See `sources.md` for how to handle each source type.
After install: run `validate-skill` on the installed path to confirm compliance.

## [2] Remove a skill

1. Ask which skill to remove (show numbered list of non-yellowpages skills)
2. Confirm: "Remove ~/.claude/skills/<name>? This deletes all files. [yes/no]"
3. On yes: `rm -rf ~/.claude/skills/<name>`
4. Confirm removal: `ls ~/.claude/skills/<name>` → "No such file or directory"

Never remove yellowpages core skills without explicit user instruction.

## [3] Update yellowpages

For git-based installs, run `git pull` in the cloned yellowpages repository.
For host plugin installs, use the host's plugin update or reinstall flow.

## [4] View skill details

Ask which skill to view. Read and display its `SKILL.md`.
