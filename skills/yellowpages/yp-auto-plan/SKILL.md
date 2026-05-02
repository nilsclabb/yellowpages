---
name: yp-auto-plan
description: Compatibility entrypoint for the old auto-plan workflow. Use `yp-workflow-plan` as the new default planning stage.
---

# Auto Plan (Compatibility)

This skill remains as a compatibility alias during the workflow migration.

## Use Instead

Load `yp-workflow-plan` for the real planning stage.

## What Still Applies

- approved scope becomes a concrete implementation plan
- `TASKS.md` remains the execution coordination artifact when needed
- planning should still identify dependencies, verification, and safe parallelism

## Rule

Do not treat this skill as the core planning architecture anymore. The real workflow path is:

```text
yp-workflow-frame -> yp-workflow-design -> yp-workflow-plan -> yp-workflow-execute
```
