---
name: yp-auto-plan
description: Use when you have an approved spec or clear requirements for a multi-step task and need a bite-sized implementation plan before touching code. Reads a spec from docs/specs/, produces a plan at docs/plans/YYYY-MM-DD-<feature>.md plus a TASKS.md for multi-agent pickup. Chains from yp-brainstorm and hands off to yp-tasks.
---

# Auto Plan

Turn an approved spec (or a clear set of requirements) into a bite-sized implementation plan. Produces two artifacts:

1. **`docs/plans/YYYY-MM-DD-<feature>.md`** — the human-readable plan with TDD task breakdown
2. **`TASKS.md`** — the machine-parseable task list for multi-agent pickup via `yp-tasks`

**Announce at start:** "I'm using `yp-auto-plan` to create the implementation plan."

## Input Sources (in priority order)

1. Spec file at `docs/specs/YYYY-MM-DD-<topic>-design.md` (produced by `yp-brainstorm`)
2. Spec path provided by the user
3. A description of work pasted by the user — if no spec exists, suggest running `yp-brainstorm` first; proceed only if the user explicitly declines

## Checklist

1. **Load the spec** — read it fully; if any section is vague, pause and ask before planning
2. **Scope check** — if the spec covers multiple independent subsystems, suggest splitting into separate plans, one per subsystem
3. **Map the file structure** — list every file to be created or modified and what each is responsible for (see `references/plan-format.md`)
4. **Decompose into tasks** — each task produces self-contained, testable changes (see `references/generation-rules.md`)
5. **Write bite-sized steps** — 2–5 minutes per step, TDD-shaped, with exact code and commands
6. **Write the plan file** — `docs/plans/YYYY-MM-DD-<feature>.md` using the header and task template in `references/plan-format.md`
7. **Generate `TASKS.md`** — machine-parseable coordination file; format in `yp-tasks/references/format.md`
8. **Self-review** — spec coverage, placeholder scan, type consistency; fix inline
9. **Execution handoff** — tell the user the plan is ready and invoke `yp-tasks pickup` when approved

## Reference Map

| When you need to... | Read |
|---|---|
| Structure the plan document (header, task template, no-placeholder rules) | [references/plan-format.md](references/plan-format.md) |
| Decompose work, identify dependencies, detect parallelism | [references/generation-rules.md](references/generation-rules.md) |
| Chain from brainstorm or hand off to tasks | [references/chaining.md](references/chaining.md) |
| Write the `TASKS.md` file | `yp-tasks/references/format.md` |

## No Placeholders

Never write "TBD", "TODO", "implement later", "add error handling", "similar to Task N", or steps that describe what without showing how. Every step contains the actual content the engineer needs. See `references/plan-format.md` for the full list.

## Execution Handoff

After saving both files, tell the user:

> "Plan saved to `docs/plans/<filename>.md` and `TASKS.md`. Ready to execute? I'll use `yp-tasks pickup` to claim the first task."
