---
name: yp-workflow-debugging
description: Use when software work stops being straightforward implementation and turns into investigation, root-cause analysis, or repeated failed fixes.
---

# Workflow Capability: Debugging

Debug systematically. Do not guess, patch blindly, or stack speculative fixes.

## Use When

- the failure cause is unknown
- the same fix attempt keeps failing
- symptoms point to timing, state, or integration issues

## Required Pattern

- reproduce the problem clearly
- gather evidence before changing code
- identify the likely root cause
- fix the cause, not just the symptom
- rerun the proving check afterward

## Often Useful In

`yp-workflow-execute`
