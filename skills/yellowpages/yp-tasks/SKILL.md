---
name: yp-tasks
description: Execution helper for task coordination in TASKS.md. Use from `yp-workflow-execute` when work benefits from explicit task claiming, status tracking, or worktree-aware coordination.
---

# Tasks

Interact with `TASKS.md` as an execution helper. This skill is no longer a primary workflow stage; it supports `yp-workflow-execute`.

⚠️ WORKTREE RULE: Every worktree MUST be merged back to its origin branch
before marking a task [X]. Marking [X] without merging = incomplete work.
See `references/worktree-protocol.md` — non-negotiable.

## Modes

- default — show current state of TASKS.md
- `yp-tasks pickup` — find and claim the next available task
- `yp-tasks complete` — mark current claimed task [X] (only after merge confirmation)
- `yp-tasks status` — summary: N done, N in-progress, N pending, N blocked

## Use When

- the plan has explicit task units
- multiple agents may coordinate through one task file
- worktree-aware claiming and completion matter

## State markers

| Marker | Meaning |
|---|---|
| `[ ]` | Not started |
| `[/]` | In progress — claimed by an agent |
| `[X]` | Complete — worktree merged, verified |
| `[!]` | Blocked — needs human or dependency failed |

## References

| File | When to read |
|---|---|
| `references/format.md` | Full TASKS.md format specification — how to write and parse task files |
| `references/pickup-protocol.md` | How to find, claim, and complete tasks (dependency resolution rules) |
| `references/worktree-protocol.md` | Mandatory worktree merge-back procedure — read before creating any worktree |
