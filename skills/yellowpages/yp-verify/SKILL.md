---
name: yp-verify
description: You MUST use this before claiming work is complete, fixed, or passing, before committing, before creating PRs, before marking a task done in TASKS.md, and before expressing satisfaction with results. Evidence before assertions, always. No completion claims without fresh verification output in the current message.
---

# Verify Work

Claiming work is complete without verification is dishonesty, not efficiency. **Evidence before claims, always.**

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you have not run the verification command in this message, you cannot claim it passes.

## The Gate

Before claiming any status or expressing satisfaction:

1. **Identify** — what command proves this claim?
2. **Run** — execute the full command fresh
3. **Read** — full output, exit code, failure count
4. **Verify** — does the output confirm the claim?
5. **Only then** — make the claim, WITH the evidence inline

Skipping any step is lying, not verifying.

## Claims → Required Evidence

| Claim | Required evidence | NOT sufficient |
|---|---|---|
| Tests pass | Test command output with 0 failures | "Should pass", previous run |
| Lint clean | Linter output: 0 errors | Partial check, extrapolation |
| Build succeeds | Build command exit code 0 | Lint passed, logs look ok |
| Bug fixed | Original-symptom test passes | Code changed, "assumed fixed" |
| Regression test works | Red → green cycle verified (write → pass → revert fix → FAIL → restore → pass) | Test passed once |
| Subagent completed | VCS diff shows changes matching report | Agent reports "success" |
| Requirements met | Line-by-line spec checklist, each verified | Tests pass |

## Red Flags — STOP

- "Should work now", "probably", "seems to"
- "Great!", "Perfect!", "Done!" before verification
- About to commit/push/PR without running verification
- Trusting a subagent's success report at face value
- Partial verification treated as complete
- "Just this once" / "I'm confident" / "I'm tired"
- Any wording that implies success without having run the command

## Rationalization → Reality

| Excuse | Reality |
|---|---|
| "Should work now" | Run the command. |
| "I'm confident" | Confidence is not evidence. |
| "Just this once" | No exceptions. |
| "Linter passed" | Linter is not the compiler. |
| "Agent said success" | Verify independently via diff. |
| "Partial check is enough" | Partial proves nothing. |

## Integration With the Chain

The standard chain runs `yp-verify` before marking a task complete:

```
yp-tasks pickup → implement → yp-verify → yp-tasks complete → merge-back
```

`yp-tasks complete` should not flip `[/]` to `[X]` until `yp-verify` has produced fresh evidence in the current message. Combine with `references/worktree-protocol.md` in `yp-tasks` for the merge-back requirement.

## The Bottom Line

Run the command. Read the output. THEN claim the result. Non-negotiable.
