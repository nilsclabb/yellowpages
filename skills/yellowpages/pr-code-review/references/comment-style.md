# Review Comment Style

Use this when writing PR comments or anticipated reviewer feedback.

## Default Format

One finding per comment. Use:

```text
<location>: <severity>: <problem>. <fix>.
```

For multi-file summaries, include the file path before the location.

## Severity

- `bug:` broken behavior, regression, data corruption, or incident risk.
- `risk:` works now but is fragile, unclear, racy, under-verified, or likely to regress.
- `nit:` small style, naming, or clarity issue the author can ignore.
- `q:` genuine question where the right fix depends on missing context.

## Drop

- Throat-clearing: "I noticed", "It seems", "You might want to consider".
- Praise per comment: say broad positive context once at most.
- Restating what the changed code already says.
- Hedging. If unsure, use `q:` and ask directly.

## Keep

- Exact file, line, symbol, function, or field names.
- The concrete fix, not "consider refactoring".
- The why when the risk is not obvious.
- Reviewer-ready wording that can be pasted into GitHub.

## Auto-Clarity Exceptions

Use a normal paragraph before returning to terse comments for:

- Security findings that need exploit or mitigation context.
- Architectural disagreements with real trade-offs.
- New-author onboarding where the why matters more than compression.
- Cross-language rollout risks where another caller must change.

## Boundary

Review comments identify issues. Do not approve, request changes, resolve threads, push, or edit code unless the user explicitly asks for that action.
