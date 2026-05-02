# Manage Project — Actions Reference

## [1] Add a skill to this project

Ask which skill to add. Options:
- From global install: list `~/.claude/skills/` dirs; symlink or copy chosen into the host's native skill path
- New skill: use `scaffold-skill` to create it under `skills/yellowpages/<name>/`

After adding: verify the skill's `SKILL.md` exists and `INDEX.md` lists it in the right router group.

## [2] Remove a skill from this project

List project-local skill links or host plugin registrations. Ask which to remove.
Confirm the exact path before deletion. Do not remove `skills/yellowpages/<name>/` unless the user is deleting the source skill.

## [3] Edit project-context.md

Read `.agents/project-context.md` — display current content.
Ask what to change. Apply edits using normal file write.
Remind: "project-context.md is read by the agent at every session start."

## [5] Open TASKS.md

Read and display `TASKS.md` if present.
If absent: "No TASKS.md found. Use `yp-auto-plan` to generate one."
