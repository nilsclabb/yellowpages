---
name: yp-workflow
description: Use for normal coding-session workflow requests: designing, planning, executing tasks, verifying completion, or reviewing code.
---

# Workflow Router

Route software-engineering work through the right process skill. This is the default category for normal coding requests.

## Routing Table

| User intent | Load |
|---|---|
| Build, change behavior, design a feature, ask "how should we..." | `yp-brainstorm` |
| Approved spec, clear requirements, "plan this" | `yp-auto-plan` |
| Execute or pick up `TASKS.md` work | `yp-tasks` |
| Claim done/fixed/passing/ready | `yp-verify` |
| Review PR, branch, diff, or merge readiness | `pr-code-review` |

## Rule

Load exactly one matching workflow skill first. If the request also needs stack-specific guidance, load `yp-stack-router` only after the workflow skill says implementation can begin.

## Chain

```text
yp-brainstorm -> yp-auto-plan -> yp-tasks -> yp-verify
```
