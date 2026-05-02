---
name: manage-project-skills
description: View and manage the current project's skill context — .agents/, CLAUDE.md, TASKS.md, and installed skills.
---

# Manage Project Skills

Full inventory and management of what the agent sees in the current project.

## What Claude shows

Scan from `process.cwd()`:
- host plugin files — `.claude-plugin/`, `.cursor-plugin/`, `.opencode/`, `.codex/`, `gemini-extension.json`
- `.agents/` — list agents, workflows, checklists, templates present
- `CLAUDE.md` — present?, section headings, line count
- `AGENTS.md` — present?
- `TASKS.md` — present?, task state summary (X done, Y in-progress, Z pending)

```
[1] Add a skill to this project
[2] Remove a skill from this project
[3] Edit project-context.md
[4] View startup bootstrap context (`using-yellowpages`)
[5] Open TASKS.md
[6] Done
```

## References

| File | When to read |
|---|---|
| `references/scanning.md` | Which paths to scan and what to report for each |
| `references/actions.md` | Step-by-step for each project management action |
