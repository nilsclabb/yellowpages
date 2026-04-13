# Worktree Protocol — Mandatory Merge-Back Procedure

⚠️ HARD REQUIREMENT: Every worktree MUST be merged back to its origin branch
before marking a task [X]. This protocol is mandatory. No exceptions.

Enforcement is instructional — no filesystem gate prevents marking [X] without
merging. The agent is expected to follow these steps faithfully. Skipping the
merge produces incomplete work that may block other agents' dependent tasks.

## Create worktree

```bash
# From the origin branch (e.g. main or feat/my-feature)
git worktree add ../worktree-<task-name> -b <worktree-branch-name>
cd ../worktree-<task-name>
```

## Work on the task

Execute the task in the worktree directory. Commit as you go.

## Merge back — mandatory checklist

Complete ALL steps before marking [X]:

- [ ] Switch to origin branch: `git checkout <origin-branch>`
- [ ] Merge worktree branch: `git merge <worktree-branch-name>`
- [ ] Resolve any merge conflicts
- [ ] Run tests on merged result and confirm passing
- [ ] Remove worktree: `git worktree remove ../worktree-<task-name>`
- [ ] Delete worktree branch: `git branch -d <worktree-branch-name>`

Only after ALL boxes are checked: mark task `[X]` in TASKS.md.

## If merge fails

Do NOT mark [X]. Instead:
1. Mark task `[!]` with `blocked-reason: merge conflict — requires manual resolution`
2. Leave worktree in place for human inspection
3. Report to the developer: what conflicted and where
