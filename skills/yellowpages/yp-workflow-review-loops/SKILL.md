---
name: yp-workflow-review-loops
description: Use when software work benefits from lightweight quality gates between stages, tasks, or batches of changes.
---

# Workflow Capability: Review Loops

Review early enough to catch drift before it compounds.

## Use When

- a task boundary is a good checkpoint
- multiple agents are contributing
- correctness and scope drift are both concerns

## Required Pattern

- review against the requirement or plan, not personal taste
- fix important issues before moving on
- rerun checks after fixes when needed

## Often Useful In

`yp-workflow-design`, `yp-workflow-verify`, `yp-workflow-review`
