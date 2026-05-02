# Brainstorm — Spec Format

## Location

Write the spec to `docs/specs/YYYY-MM-DD-<topic>-design.md`. Create the `docs/specs/` directory if it does not exist. Commit the spec before handing off to `yp-auto-plan`.

## Required Sections

Every spec MUST include these sections in this order:

```markdown
# <Topic> — Design Spec

_Author: <user>_ · _Date: YYYY-MM-DD_ · _Status: draft | approved_

## Problem

One or two paragraphs. What hurts today, who feels it, why now.

## Goal

One sentence. The outcome, not the feature. "Users can restore a deleted document within 24 hours" — not "add a restore button".

## Non-Goals

Bulleted list of things explicitly out of scope. This is where YAGNI lives.

## Approach

The recommended approach from the interview, with a one-paragraph justification. Mention the alternatives considered and why they were rejected.

## Architecture

How the pieces fit together. Diagram if helpful. Identify the units with clear boundaries and interfaces.

## Components

Table or list. For each unit: what it does, how you use it, what it depends on.

## Data Flow

What moves where, in what format. API shapes, schemas, events.

## Error Handling

Failure modes and recovery. What breaks, how we detect it, how we recover.

## Testing Strategy

How we will verify correctness. Unit, integration, manual, staging.

## Success Criteria

Observable outcomes that prove the goal was met. Ideally measurable.

## Open Questions

Things we deferred. Flag them here so the plan phase can pick them up or explicitly defer further.
```

## Self-Review Checklist

After writing, re-read with fresh eyes:

1. **Placeholder scan** — any "TBD", "TODO", or vague requirements? Fix inline.
2. **Internal consistency** — do any sections contradict each other? Does Architecture match Components?
3. **Scope check** — is this focused enough for a single implementation plan, or does it need decomposition?
4. **Ambiguity check** — could any requirement be read two different ways? Pick one and make it explicit.

Fix issues inline. No need to re-review.

## User Review Gate

After self-review passes, ask the user:

> "Spec written and committed to `<path>`. Please review it and let me know if you want any changes before we move to the implementation plan."

Wait for explicit approval. If changes requested, make them and re-run self-review. Only after approval: invoke `yp-auto-plan`.
