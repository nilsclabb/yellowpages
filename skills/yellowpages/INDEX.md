# Yellowpages Skills Index

Read this for repository audits and skill maintenance. Runtime routing starts at `using-yellowpages`.

## Runtime Routers

| Router | When to load |
|---|---|
| `using-yellowpages` | Session bootstrap; routes only to category routers |
| `yp-workflow` | Coding workflow: design, plan, execute, verify, review |
| `yp-skill-system` | Yellowpages/skill authoring, validation, diagnosis, management |
| `yp-stack-router` | Stack/domain guidance: Convex, React, UI, monorepo |
| `yp-session-tools` | Help, status, context, notes, reload, compression |

## Leaf Skill Groups

| Group | Skills |
|---|---|
| Workflow | `yp-brainstorm`, `yp-auto-plan`, `yp-tasks`, `yp-verify`, `pr-code-review` |
| Skill system | `yellowpages`, `scaffold-skill`, `validate-skill`, `yp-diagnose`, `manage-global-skills`, `manage-project-skills` |
| Stack | `preferred-stack`, `convex-patterns`, `frontend-architecture`, `ui-component-system`, `monorepo-setup`, `react-patterns` |
| Session tools | `yp-help`, `yp-status`, `yp-context`, `yp-session`, `yp-reload`, `yp-notes`, `yp-remember`, `yp-forget`, `yp-compress` |

## Commands

Only high-level chat commands live in `commands/`; skills load through native skill discovery.
