---
name: yp-brainstorm
description: Compatibility entrypoint for the old brainstorming workflow. Use `yp-workflow-frame` and `yp-workflow-design` as the new default path.
---

# Brainstorm (Compatibility)

This skill remains for compatibility while Yellowpages migrates to the six-stage workflow.

## Use Instead

```text
yp-workflow-frame -> yp-workflow-design -> yp-workflow-plan
```

## Mapping

| If the job is... | Load |
|---|---|
| clarify the request, assumptions, or success criteria | `yp-workflow-frame` |
| compare approaches and shape the design | `yp-workflow-design` |
| turn approved scope into a plan | `yp-workflow-plan` |

## Rule

Do not treat "brainstorm" as the whole methodology anymore. Use the new staged flow and keep this skill as a compatibility alias only.
