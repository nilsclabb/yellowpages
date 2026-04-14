---
name: yp-help
description: Quick reference card for all yp-stack commands, caveman modes, and installed skills.
command: /yp:help
---

# /yp:help

Quick reference for the yp-stack. One-shot display.

## yp-stack Commands

| Command | What it does |
|---|---|
| `/yp:help` | This card |
| `/yp:status` | Session snapshot — caveman mode, skills, project context, hook health |
| `/yp:context` | Everything injected at session start |
| `/yp:session` | Model, estimated context pressure, active hooks |
| `/yp:reload` | Re-read CLAUDE.md and skills state via tool use |
| `/yp:notes` | Print CLAUDE.md contents |
| `/yp:remember <fact>` | Append persistent note to CLAUDE.md Agent Notes |
| `/yp:forget <fact>` | Remove note from CLAUDE.md Agent Notes |
| `/yp:diagnose` | Scan all skills for yellowpages compliance issues |
| `/yp:scaffold <name>` | Create new yellowpages-compliant skill |
| `/yp:validate <path>` | Run quality checklist on any skill |
| `/yp:compress <file>` | Rewrite memory file in terse form (~46% token reduction) |
| `/yp:manage-global` | Inventory + manage globally installed skill libraries |
| `/yp:manage-project` | Inventory + manage current project skill context |
| `/yp:tasks` | View, claim, and complete tasks in TASKS.md |
| `/yp:auto-plan` | Generate TASKS.md from a description of work |
| `/yp:upgrade` | Update yp-stack to latest version |

## Caveman Modes

| Command | Effect |
|---|---|
| `/yp:caveman` | Full mode (default) |
| `/yp:caveman full` | Full mode (explicit) |
| `/yp:caveman lite` | Drop filler, keep grammar |
| `/yp:caveman ultra` | Maximum compression |
| `"stop caveman"` | Normal prose (session-local on non-Claude Code) |
