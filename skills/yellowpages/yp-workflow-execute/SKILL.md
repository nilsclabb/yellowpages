---
name: yp-workflow-execute
description: Use when carrying out approved software work. Keeps execution minimal, surgical, and aligned with the approved plan or explicit user direction.
---

# Execute Work

Implement the work without drifting. This stage is about disciplined execution, not redesigning the project mid-flight.

## Required

- follow the approved plan or explicit user direction
- keep changes surgical and minimal
- prefer the simplest code that satisfies the requirement
- stop and ask when blocked instead of guessing
- load stack or capability skills only when they are actually needed

## Execution Helpers

| When useful | Load |
|---|---|
| You want coordinated task claiming or status tracking | `yp-tasks` |
| Focused delegation would improve execution | `yp-workflow-subagents` |
| Independent work can run safely in parallel | `yp-workflow-parallel-agents` |
| Isolation or branch cleanup matters | `yp-workflow-git-worktrees` |
| Test-first execution or regressions matter | `yp-workflow-tdd` |
| The work turns into debugging | `yp-workflow-debugging` |

## Exit Criteria

Leave this stage only when implementation is complete enough to prove something with fresh evidence.

## Next Step

Go to `yp-workflow-verify`.
