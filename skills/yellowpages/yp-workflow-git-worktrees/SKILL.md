---
name: yp-workflow-git-worktrees
description: Use when software work should run in an isolated branch/worktree and later merge back cleanly.
---

# Workflow Capability: Git Worktrees

Use worktrees for isolation, not as a default ritual.

## Use When

- parallel implementation would conflict in one checkout
- you want safer branch isolation
- a task needs separate execution context

## Avoid When

- the task is tiny and local
- the user explicitly wants to stay on the current branch
- merge-back overhead would outweigh the benefit

## Required Pattern

- create the worktree from the correct origin branch
- do the work inside that worktree
- merge back before claiming the task complete
- clean up the worktree after merge

## Often Useful In

`yp-workflow-plan`, `yp-workflow-execute`
