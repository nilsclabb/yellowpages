---
name: yp-workflow-frame
description: Use when starting software work to clarify the request, surface assumptions, define success criteria, and decide whether work should proceed to design, plan, or direct execution.
---

# Frame Work

Start here when the request is still fuzzy. The job of this stage is to reduce ambiguity before solutioning.

## Required

- clarify the actual goal, not just the asked action
- surface assumptions instead of picking one silently
- name constraints, risks, and success criteria
- classify the work: trivial, normal, or complex
- push back on obvious overcomplication

## User Override

The user can skip or narrow this stage. If they do, carry their constraint forward explicitly instead of pretending the ambiguity is gone.

## Optional Capabilities

| When useful | Load |
|---|---|
| You want a stronger questioning or delegation pattern | `yp-workflow-subagents` |
| Another agent needs a crisp brief or progress contract | `yp-workflow-handoffs` |

## Exit Criteria

Leave this stage only when all of these are true:

- the request meaning is clear enough to act on
- success can be checked later
- the next step is obvious

## Next Step

- If approach choices still matter, go to `yp-workflow-design`
- If the design is already clear, go to `yp-workflow-plan`
- If the work is truly trivial and the user wants speed, go to `yp-workflow-execute`
