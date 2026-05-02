---
name: yp-workflow-review
description: Use when software work needs correctness review, readiness checks, risk identification, or PR-oriented inspection after verification.
---

# Review Work

Review the result as a work product. Lead with correctness, risk, missing verification, and readiness rather than commentary.

## Required

- inspect whether the result matches the requirement or plan
- look for bugs, regressions, risk, and missing checks first
- call out open questions and remaining blockers clearly
- keep review output actionable

## Specialized Review Paths

| When useful | Load |
|---|---|
| The user explicitly wants PR, branch, or diff review | `pr-code-review` |
| You want extra readiness gates between stages | `yp-workflow-review-loops` |
| Another agent or human needs a clean summary | `yp-workflow-handoffs` |

## Next Step

- If issues remain, route back to `yp-workflow-execute`
- If the review is clean, hand off or close the loop per user direction
