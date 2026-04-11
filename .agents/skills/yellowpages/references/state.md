# State Tracking

This file defines how agents track workflow progress using YAML frontmatter in output artifacts.

## The Problem

Workflows span multiple steps and sometimes multiple sessions. Without state tracking, an agent starting a new session has no way to know where the previous session left off without re-reading everything.

## The Solution: YAML Frontmatter State

Any artifact produced by a multi-step workflow carries its own progress state in YAML frontmatter. The agent reads this block at the start of a new session to resume exactly where it left off.

## Standard State Fields

```yaml
---
workflow: create-skill            # Which workflow produced this artifact
stepsCompleted:                   # List of completed step file names
  - step-01-understand
  - step-02-plan
lastStep: step-02-plan            # Most recently completed step
lastSaved: 2025-04-11             # ISO date of last update
status: in-progress               # in-progress | complete | blocked
---
```

## Rules

- **Update on every step completion.** After finishing a step, update `stepsCompleted`, `lastStep`, and `lastSaved` before closing.
- **Read before starting.** When resuming a workflow on an existing artifact, read the frontmatter first to determine which step comes next.
- **`status: blocked`** — Use when the workflow cannot proceed without user input. Add a `blockedReason` field explaining what is needed.
- **`status: complete`** — Set only when all steps have been completed and the artifact has been verified.

## Resume Protocol

1. Open the artifact
2. Read the YAML frontmatter
3. Find the last completed step in `stepsCompleted`
4. Open the next step file (`nextStep` pointer in the last completed step)
5. Continue from there

## Minimal Example

An `implementation_plan.md` tracked through a workflow:

```yaml
---
workflow: create-skill
stepsCompleted: [step-01-understand]
lastStep: step-01-understand
lastSaved: 2025-04-11
status: in-progress
---
```
