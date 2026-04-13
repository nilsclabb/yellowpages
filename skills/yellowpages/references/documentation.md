# Documentation Standard

This file defines how planning work should be documented. Apply this standard on any task that warrants an implementation plan.

## The Three Documents

### `implementation_plan.md` — Design & Approval

**Purpose:** Communicate a technical plan to the user for review before executing.

**When to create:** Any task requiring architectural decisions, multiple file changes, or significant ambiguity.

**Required sections:**

```markdown
# [Goal]
Brief description of the problem and what the change accomplishes.

## User Review Required
Breaking changes, design decisions, open questions — use GitHub alerts.

## Proposed Changes
Grouped by component. Files marked [MODIFY], [NEW], or [DELETE].

## Verification Plan
How you'll confirm the changes worked.
```

**Where to save:** `<appDataDir>/brain/<conversation-id>/implementation_plan.md`

---

### `task.md` — Execution Tracker

**Purpose:** A living TODO list to track progress during execution.

**When to create:** After the user approves an implementation plan.

**Format:**
```markdown
- `[ ]` not started
- `[/]` in progress
- `[x]` completed
```

Update continuously: mark `[/]` when starting, `[x]` when done.

**Where to save:** `<appDataDir>/brain/<conversation-id>/task.md`

---

### `walkthrough.md` — Post-Work Summary

**Purpose:** Summarize what was built, tested, and verified. Update rather than replace for follow-up work.

**Include:**
- Summary of changes made
- How changes were tested/verified
- Embedded screenshots or recordings of UI changes

**Where to save:** `<appDataDir>/brain/<conversation-id>/walkthrough.md`

---

## Scratch Files

Temporary scripts, debug outputs, and one-off data files go in:
```
<appDataDir>/brain/<conversation-id>/scratch/
```

Do not save scratch files in the project workspace.

## Artifacts vs. Direct Responses

Use an artifact (markdown file) for: reports, tables, plans, walkthroughs, content you'll update over time.

Respond directly (no artifact) for: short answers, questions, single-paragraph explanations.

---

## Committed Plans (Repo-Persistent)

For plans that span multiple sessions, serve as subagent context, or document architectural decisions:

**Location:** `docs/superpowers/plans/YYYY-MM-DD-NN-name.md`
`NN` = two-digit sequential number per date (`01`, `02`, …).

**Structure:**

    # [Feature] Implementation Plan
    Goal / Architecture / Tech Stack
    ## File Map — table of files + responsibilities
    ## Phase N: [Name] — steps with acceptance criteria
    ## Risks + Mitigations / Success Metrics / File Touch List

Use ephemeral plans for exploratory or short-lived work. Commit when the plan spans sessions or needs to be subagent-readable.
