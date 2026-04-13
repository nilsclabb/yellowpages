# TASKS.md Pickup Protocol

## Finding available tasks

1. Read `TASKS.md`
2. Collect all `[ ]` tasks
3. Filter: keep only tasks where all `depends:` entries are `[X]`
   - **Explicit deps**: task lists `depends: Task A, Task B` → available when all named tasks are `[X]`
   - **Sequential fallback**: no `depends:` declared → available when all tasks above it in the file are `[X]`
4. Result: the claimable task set. Multiple tasks in this set = can be worked in parallel by different agents.

## Claiming a task

1. Choose a task from the claimable set
2. Update its marker from `[ ]` to `[/]`
3. Add metadata on the next line (2-space indent):
   ```
     worktree: <branch-name> · agent started: <ISO-8601-timestamp>
     ⚠️  MERGE REQUIRED before marking [X]
   ```
4. Write the file (the timestamp + worktree name acts as a claim token for other agents)

## Completing a task

Only after confirming all worktree steps in `worktree-protocol.md`:

1. Remove the `worktree:` and `⚠️ MERGE REQUIRED` metadata lines
2. Change marker from `[/]` to `[X]`
3. Add completion note if useful: `  completed: <ISO timestamp>`

## Handling [!] blocked tasks

Blocked tasks require human intervention. Do not claim them. Leave as `[!]`.
When human resolves: change `[!]` to `[ ]` and remove `blocked-reason:`.
