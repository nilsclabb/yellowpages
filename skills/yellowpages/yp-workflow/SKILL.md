---
name: yp-workflow
description: Use for normal software-building workflow requests. Routes work into the six-stage lifecycle: frame, design, plan, execute, verify, review.
---

# Workflow Router

Route software-engineering work through the right core workflow stage. This is the default category for normal coding requests.

## Routing Table

| User intent | Load |
|---|---|
| Clarify the request, assumptions, scope, or success criteria | `yp-workflow-frame` |
| Compare approaches or shape the design | `yp-workflow-design` |
| Turn approved scope into an implementation plan | `yp-workflow-plan` |
| Carry out approved work or coordinated tasks | `yp-workflow-execute` |
| Claim done, fixed, passing, or ready | `yp-workflow-verify` |
| Review correctness, readiness, or PR quality | `yp-workflow-review` |

## Rule

Load exactly one matching workflow stage first. Keep the core lean: if a stage needs extra tactics, load an optional `yp-workflow-*` capability only when the situation warrants it.

If the request also needs stack-specific guidance, load `yp-stack-router` only after the workflow stage says implementation can begin.

## Lifecycle

```text
frame -> design -> plan -> execute -> verify -> review
```
