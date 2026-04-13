---
name: yp-help
description: Quick reference card for all yp-stack commands, caveman modes, and installed skills.
---

# /help

Quick reference for the yp-stack. One-shot display.

## yp-stack Commands

| Command | What it does |
|---|---|
| `/help` | This card |
| `/status` | Session snapshot — caveman mode, skills, project context, hook health |
| `/context` | Everything injected at session start |
| `/session` | Model, estimated context pressure, active hooks |
| `/reload` | Re-read CLAUDE.md and skills state via tool use |
| `/notes` | Print CLAUDE.md contents |
| `/remember <fact>` | Append persistent note to CLAUDE.md Agent Notes |
| `/forget <fact>` | Remove note from CLAUDE.md Agent Notes |
| `/diagnose` | Scan all skills for yellowpages compliance issues |
| `/scaffold skill <name>` | Create new yellowpages-compliant skill |
| `/validate skill <path>` | Run quality checklist on any skill |
| `/compress <file>` | Rewrite memory file in terse form (~46% token reduction) |
| `/manage global skills` | Inventory + manage globally installed skill libraries |
| `/manage project skills` | Inventory + manage current project skill context |
| `/tasks` | View, claim, and complete tasks in TASKS.md |
| `/auto-plan` | Generate TASKS.md from a description of work |

## Caveman Modes

| Command | Effect |
|---|---|
| `/caveman` | Full mode (default) |
| `/caveman full` | Full mode (explicit) |
| `/caveman lite` | Drop filler, keep grammar |
| `/caveman ultra` | Maximum compression |
| `"stop caveman"` | Normal prose (session-local on non-Claude Code) |
