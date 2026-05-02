# Auto-Plan — Chaining

## The Standard Chain

```
yp-brainstorm  →  yp-auto-plan  →  yp-tasks pickup  →  yp-verify  →  yp-tasks complete
  (spec)           (plan + TASKS.md)   (execute)        (evidence)     (merge + mark done)
```

Each step hands off explicitly. No skipping. `yp-verify` is the gate between "work claimed done" and "task marked complete" — no `[X]` without fresh verification output.

## Coming From Brainstorm

`yp-brainstorm` ends by writing a spec to `docs/specs/YYYY-MM-DD-<topic>-design.md`, getting user approval, then invoking `yp-auto-plan`.

When invoked from brainstorm, `yp-auto-plan`:

1. Reads the most recent spec in `docs/specs/` (or the one the user named)
2. Validates the spec has all required sections (Problem, Goal, Non-Goals, Approach, Architecture, Components, Data Flow, Error Handling, Testing Strategy, Success Criteria)
3. If any section is missing or vague, pauses and asks the user to re-open `yp-brainstorm` rather than guessing
4. Otherwise proceeds to plan generation

## Coming From a User With No Spec

If the user runs `yp-auto-plan` without a spec:

1. Check if a spec exists in `docs/specs/` that matches the request
2. If not, suggest running `yp-brainstorm` first — this is almost always the right answer
3. If the user explicitly declines the brainstorm phase (e.g. "this is a config tweak, just write tasks"), proceed but keep the plan minimal and flag any assumption

## Handing Off To Tasks

After `yp-auto-plan` writes both the plan document and `TASKS.md`, surface this exact prompt:

> "Plan saved to `docs/plans/<filename>.md` and `TASKS.md`. Ready to execute? I'll run `yp-tasks pickup` to claim the first task."

On user approval, invoke `yp-tasks pickup`. Do not invoke other implementation skills directly — domain skills (`convex-patterns`, `frontend-architecture`, etc.) activate during task execution based on the task description, not from here.

## When a Task Produces a Worktree

`yp-tasks` manages worktree creation and merge-back. Plans should assume worktrees exist; the plan text references paths relative to the project root, not worktree-specific paths. See `yp-tasks/references/worktree-protocol.md` for the non-negotiable merge-back rule.

## Re-Planning

If execution reveals the plan is wrong (missed dependency, spec was incomplete, approach doesn't work):

1. Stop execution via `yp-tasks` `[!]` blocked marker
2. Return to `yp-brainstorm` to revise the spec (not `yp-auto-plan` directly — specs drive plans)
3. Re-run `yp-auto-plan` against the updated spec
4. Resume `yp-tasks pickup`

Never patch the plan without updating the spec first. Specs are the source of truth.
