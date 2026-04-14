---
name: manage-project-skills
description: View and manage the current project's skill context — .agents/, CLAUDE.md, TASKS.md, and installed skills.
command: /yp:manage-project
---

# /yp:manage-project

Full inventory and management of what the agent sees in the current project.

## What Claude shows

Scan from `process.cwd()`:
- `yellowpages.config.json` — platform, scope, version, install date
- `.agents/` — list skills, workflows, checklists, templates present
- `CLAUDE.md` — present?, section headings, line count
- `AGENTS.md` — present?
- `TASKS.md` — present?, task state summary (X done, Y in-progress, Z pending)

```
[1] Add a skill to this project
[2] Remove a skill from this project
[3] Edit project-context.md
[4] View what agent loads on startup (/yp:context)
[5] Open TASKS.md
[6] Done
```

## References

| File | When to read |
|---|---|
| `references/scanning.md` | Which paths to scan and what to report for each |
| `references/actions.md` | Step-by-step for each project management action |
