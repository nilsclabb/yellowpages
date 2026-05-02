---
name: yp-workflow-tdd
description: Use when test-first execution, regression-proof fixes, or stronger verification discipline would improve software work.
---

# Workflow Capability: TDD

Use test-first discipline when it materially lowers regression risk or sharpens success criteria.

## Use When

- fixing a bug with a reproducible symptom
- adding behavior that benefits from explicit examples
- verifying a regression path matters

## Avoid When

- the change is documentation-only
- no meaningful automated check exists and building one would be wasteful

## Required Pattern

- express the expected behavior in a failing test or check
- make the smallest change that turns it green
- rerun the proving command before claiming success

## Often Useful In

`yp-workflow-plan`, `yp-workflow-execute`, `yp-workflow-verify`
