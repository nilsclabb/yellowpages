# YP Utility Skills Index

All yp-stack utility and management skills. Invoke by typing the command in any session.

## Session & Context

| Skill | Command | When to use |
|---|---|---|
| `yp-help` | `/help` | Quick reference for all commands |
| `yp-status` | `/status` | Session health check and current state |
| `yp-context` | `/context` | See everything the agent loaded at startup |
| `yp-session` | `/session` | Model info and estimated context pressure |
| `yp-reload` | `/reload` | Re-read CLAUDE.md and skills after changes |
| `yp-notes` | `/notes` | Show CLAUDE.md contents |
| `yp-remember` | `/remember <fact>` | Append persistent note to CLAUDE.md |
| `yp-forget` | `/forget <fact>` | Remove note from CLAUDE.md |

## Skill Management

| Skill | Command | When to use |
|---|---|---|
| `manage-global-skills` | `/manage global skills` | Inventory and manage globally installed libraries |
| `manage-project-skills` | `/manage project skills` | Inventory and manage current project context |
| `scaffold-skill` | `/scaffold skill <name>` | Create new yellowpages-compliant skill |
| `validate-skill` | `/validate skill <path>` | Run quality checklist on any skill |
| `yp-diagnose` | `/diagnose` | Skill doctor — find and fix compliance issues |
| `yp-compress` | `/compress <file>` | Rewrite memory file to cut input tokens ~46% |

## Task Orchestration

| Skill | Command | When to use |
|---|---|---|
| `yp-tasks` | `/tasks` | View, claim, and complete tasks in TASKS.md |
| `auto-plan` | `/auto-plan` | Generate TASKS.md from a description of work |
