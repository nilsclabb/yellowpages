---
name: yp-workflow-verify
description: Use before any claim that work is complete, fixed, passing, ready, or safe to hand off. Requires fresh evidence before assertions.
---

# Verify Work

This stage exists to prevent false completion. Evidence comes before claims, not after.

## Required

- identify the command or check that proves the claim
- run the check fresh
- read the real output, exit code, and failures
- compare the evidence to the claim
- report actual status, not wished-for status

## Rule

No completion claims without fresh verification evidence in the current message.

## Optional Capabilities

| When useful | Load |
|---|---|
| Verification should include red-green discipline | `yp-workflow-tdd` |
| You want an additional gate before moving on | `yp-workflow-review-loops` |
| The result needs a cleaner progress or handoff summary | `yp-workflow-handoffs` |

## Next Step

- If the work is proven and needs human-quality inspection, go to `yp-workflow-review`
- If execution is not actually complete, go back to `yp-workflow-execute`
