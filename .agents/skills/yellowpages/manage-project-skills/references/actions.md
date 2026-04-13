# Manage Project — Actions Reference

## [1] Add a skill to this project

Ask which skill to add. Options:
- From global install: list `~/.claude/skills/` dirs; copy chosen to `.agents/skills/yellowpages/<name>/`
- New skill: trigger `/scaffold skill <name>` workflow

After adding: verify `.agents/skills/yellowpages/<name>/SKILL.md` exists.

## [2] Remove a skill from this project

List `.agents/skills/` contents. Ask which to remove.
Confirm: "Remove .agents/skills/yellowpages/<name>/? [yes/no]"
On yes: `rm -rf .agents/skills/yellowpages/<name>`

## [3] Edit project-context.md

Read `.agents/project-context.md` — display current content.
Ask what to change. Apply edits using normal file write.
Remind: "project-context.md is read by the agent at every session start."

## [5] Open TASKS.md

Read and display `TASKS.md` if present.
If absent: "No TASKS.md found. Use `/auto-plan` to generate one."
