---
name: yp-workflow-design
description: Use when software work needs approach selection, scope boundaries, or a concrete design before planning or implementation.
---

# Design Work

Turn a framed request into the simplest sufficient design. This stage exists to make trade-offs explicit before code exists.

## Required

- propose 2-3 viable approaches when the choice matters
- recommend the simplest sufficient option
- define boundaries, interfaces, and non-goals
- split large work into smaller bounded units
- remove speculative features and abstractions

## Rule

Do not jump from uncertainty straight into implementation. If design choices are still unresolved, settle them here first.

## Optional Capabilities

| When useful | Load |
|---|---|
| You need better delegation or design handoff patterns | `yp-workflow-subagents` |
| You want concise review checkpoints before planning | `yp-workflow-review-loops` |

## Exit Criteria

Leave this stage only when:

- a recommended approach is selected
- non-goals are explicit
- the design is concrete enough to plan

## Next Step

Go to `yp-workflow-plan`.
