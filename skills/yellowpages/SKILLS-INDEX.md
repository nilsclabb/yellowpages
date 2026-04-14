# YP Utility Skills Index

All yp-stack utility and management skills. Invoke by typing the command in any session.

## Session & Context

| Skill | Command | When to use |
|---|---|---|
| `yp-help` | `/yp:help` | Quick reference for all commands |
| `yp-status` | `/yp:status` | Session health check and current state |
| `yp-context` | `/yp:context` | See everything the agent loaded at startup |
| `yp-session` | `/yp:session` | Model info and estimated context pressure |
| `yp-reload` | `/yp:reload` | Re-read CLAUDE.md and skills after changes |
| `yp-notes` | `/yp:notes` | Show CLAUDE.md contents |
| `yp-remember` | `/yp:remember <fact>` | Append persistent note to CLAUDE.md |
| `yp-forget` | `/yp:forget <fact>` | Remove note from CLAUDE.md |

## Skill Management

| Skill | Command | When to use |
|---|---|---|
| `manage-global-skills` | `/yp:manage-global` | Inventory and manage globally installed libraries |
| `manage-project-skills` | `/yp:manage-project` | Inventory and manage current project context |
| `scaffold-skill` | `/yp:scaffold <name>` | Create new yellowpages-compliant skill |
| `validate-skill` | `/yp:validate <path>` | Run quality checklist on any skill |
| `yp-diagnose` | `/yp:diagnose` | Skill doctor — find and fix compliance issues |
| `yp-compress` | `/yp:compress <file>` | Rewrite memory file to cut input tokens ~46% |

## Task Orchestration

| Skill | Command | When to use |
|---|---|---|
| `yp-tasks` | `/yp:tasks` | View, claim, and complete tasks in TASKS.md |
| `auto-plan` | `/yp:auto-plan` | Generate TASKS.md from a description of work |

## Maintenance

| Skill | Command | When to use |
|---|---|---|
| `yp-upgrade` | `/yp:upgrade` | Update yp-stack to latest version |
