---
name: yp-tasks
description: View, claim, and complete tasks in TASKS.md — multi-agent parallel task coordination.
---

# /yp:tasks

Interact with `TASKS.md` task coordination file. Supports multi-agent parallel execution.

⚠️ WORKTREE RULE: Every worktree MUST be merged back to its origin branch
before marking a task [X]. Marking [X] without merging = incomplete work.
See `references/worktree-protocol.md` — non-negotiable.

## Commands

- `/yp:tasks` — show current state of TASKS.md
- `/yp:tasks pickup` — find and claim the next available task
- `/yp:tasks complete` — mark current claimed task [X] (only after merge confirmation)
- `/yp:tasks status` — summary: N done, N in-progress, N pending, N blocked

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
