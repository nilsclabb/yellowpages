---
name: yp-verify
description: Compatibility entrypoint for the old verification stage. Use `yp-workflow-verify` as the new default verification stage.
---

# Verify Work (Compatibility)

This skill remains as a compatibility alias during the workflow migration.

## Use Instead

Load `yp-workflow-verify`.

## Rule That Still Applies

```text
No completion claims without fresh verification evidence.
```

## Typical Flow

```text
yp-workflow-execute -> yp-workflow-verify -> yp-workflow-review
```
