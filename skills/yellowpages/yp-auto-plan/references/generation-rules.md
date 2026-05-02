# Auto-Plan — Generation Rules

## Task decomposition

Break work into tasks that are:
- **Independently executable** — one agent can do it without waiting for ongoing parallel work
- **Clearly bounded** — obvious when it's done
- **Appropriately sized** — 30 min to 4 hours per task; split larger work

## Dependency identification

A task B depends on task A when:
- B requires files, data, or outputs that A creates
- B's correctness depends on A being complete first
- B tests or validates A's output

When in doubt: prefer explicit `depends:` over relying on sequential fallback. Explicit is safer for multi-agent pickup.

## Parallelism detection

Tasks can run in parallel when:
- They have no shared `depends:` targets
- They modify different files or directories
- Their outputs don't feed into each other

Flag parallelisable groups in the summary: "Tasks 3, 4, 5 can run in parallel after Task 2."

## Task naming rules

- Names must be unique within the file
- Use descriptive names: "Implement JWT validation" not "Task 3"
- Avoid generic names that could repeat: "Write tests" → "Write tests for JWT validation"

## File header

Always include:
```markdown
# Plan: <one-line description>

_Started: <YYYY-MM-DD> · Branch: <current-branch-name>_

## Tasks
```

## After generation

Run through the file and verify:
- All `depends:` values match actual task names exactly (case-sensitive)
- No duplicate task names
- Sequential fallback tasks (no `depends:`) are in logical order
