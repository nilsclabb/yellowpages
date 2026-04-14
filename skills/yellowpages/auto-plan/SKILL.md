---
name: auto-plan
description: Generate a TASKS.md task coordination file from a description of work, problem list, or requirements.
command: /yp:auto-plan
---

# /yp:auto-plan

Generate a `TASKS.md` from any description of work. The output enables multi-agent parallel execution via the `/yp:tasks` pickup protocol.

**Usage:** `/yp:auto-plan` then describe what needs to be built, or paste a list of requirements.

## What Claude does

1. Ask for a description of the work if not already provided
2. Identify independent vs. sequential tasks (see `references/generation-rules.md`)
3. Declare explicit `depends:` for tasks that require other tasks to complete first
4. Identify parallelisable tasks (tasks with no shared dependencies)
5. Write `TASKS.md` to the current project root (or ask for path)
6. Print summary: "N tasks · N can start now · N parallelisable once Task X completes"

## Output

A valid `TASKS.md` following the format in `yp-tasks/references/format.md`.

## References

| File | When to read |
|---|---|
| `references/generation-rules.md` | How to decompose work into tasks, identify dependencies, and detect parallelism |
