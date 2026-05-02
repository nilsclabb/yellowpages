---
name: yp-workflow-plan
description: Use when the design or requirements are clear and the work needs to be decomposed into an execution plan with verification and task boundaries.
---

# Plan Work

Convert approved scope into an execution plan. The plan should make the next implementation steps obvious without bloating runtime context.

## Required

- map files and responsibilities before task breakdown
- decompose work into bounded, testable tasks
- define how each task will be verified
- identify dependencies and safe parallelism
- keep the plan YAGNI and execution-ready

## Optional Capabilities

| When useful | Load |
|---|---|
| Multiple agents may work independently | `yp-workflow-parallel-agents` |
| Work should happen in isolated branches | `yp-workflow-git-worktrees` |
| Tests should drive implementation details | `yp-workflow-tdd` |

## Exit Criteria

Leave this stage only when:

- the task breakdown is coherent
- verification is named for each unit of work
- the first execution step is clear

## Next Step

Go to `yp-workflow-execute`. If the user wants formal task coordination, use `yp-tasks` as the execution helper.
