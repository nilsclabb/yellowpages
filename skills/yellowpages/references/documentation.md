# Documentation Standard

This file defines where planning and work artifacts live. Never write plan, task, walkthrough, or scratch files to the repo root.

## Path Rules

| Document | Ephemeral path | Committed path |
|---|---|---|
| Implementation plan | `.agents/state/plans/<slug>/implementation_plan.md` | `docs/plans/YYYY-MM-DD-NN-name.md` |
| Task tracker | `.agents/state/plans/<slug>/task.md` | `TASKS.md` when coordinating agents |
| Walkthrough | `.agents/state/plans/<slug>/walkthrough.md` | `docs/plans/YYYY-MM-DD-NN-name-walkthrough.md` |
| Scratch files | `.agents/state/plans/<slug>/scratch/` | never committed |

`<slug>` = short kebab-case description of the work.

Use ephemeral paths for session-local work. Commit artifacts only when they span sessions, guide subagents, or document architectural decisions.

## Implementation Plans

Create when work requires architecture decisions, multiple file changes, or user approval before execution.

Required sections:

```markdown
# [Goal]

## User Review Required
Breaking changes, design decisions, open questions.

## Proposed Changes
Grouped by component. Mark files [MODIFY], [NEW], or [DELETE].

## Verification Plan
How the work will be checked.
```

## Task Trackers

Use checkbox markers:

```markdown
- [ ] not started
- [/] in progress
- [x] completed
- [!] blocked
```

Update continuously. Mark `[x]` only after verification.

## Walkthroughs

Use for post-work summaries. Include:

- what changed,
- what was tested,
- what remains risky,
- screenshots or recordings for UI work.

## Scratch Files

Temporary scripts, debug outputs, and one-off data files go in:

```text
.agents/state/plans/<slug>/scratch/
```

Delete scratch files when they no longer explain or reproduce the work.

## Direct Responses

Respond directly, with no artifact, for short answers, single-file explanations, tiny edits, or quick factual checks.
