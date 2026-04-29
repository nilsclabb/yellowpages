# YP Skills Index

All yp-stack skills. Commands derived from `command` field in each SKILL.md frontmatter.

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
| `caveman` | `/caveman [full\|lite\|ultra]` | Toggle terse communication mode |

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
| `yp-tasks` | `/yp:tasks [pickup\|complete\|status]` | View, claim, and complete tasks in TASKS.md |
| `auto-plan` | `/yp:auto-plan` | Generate TASKS.md from a description of work |

## Maintenance

| Skill | Command | When to use |
|---|---|---|
| `yp-upgrade` | `/yp:upgrade` | Update yp-stack to latest version |

## Review & Quality

| Skill | Command | When to use |
|---|---|---|
| `pr-code-review` | `/pr-code-review` | Review PRs for recurring mistakes, terse comments, verification, and CI closeout |

## Domain Skills

| Skill | Command | When to use |
|---|---|---|
| `preferred-stack` | `/preferred-stack` | Tech stack choices and architectural decisions |
| `convex-patterns` | `/convex-patterns` | Convex backend functions, schema, auth patterns |
| `frontend-architecture` | `/frontend-architecture` | React app structure, routing, state management |
| `ui-component-system` | `/ui-component-system` | Design system, Radix UI, Tailwind, CVA components |
| `monorepo-setup` | `/monorepo-setup` | Bun + Turborepo workspace and deployment config |
| `react-patterns` | `/react-patterns` | React coding patterns and anti-patterns |
