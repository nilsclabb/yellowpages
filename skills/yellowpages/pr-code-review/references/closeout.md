# PR Closeout

Use this when the user asked to fix review issues, prepare a branch for submission, or summarize resolved PR comments.

## Final Response Shape

Report in this order:

1. What changed and which review pattern it resolves.
2. Review comments or anticipated comments addressed.
3. Tests and checks run, with failures or skipped checks called out.
4. CI status when available.
5. Remaining blockers, unresolved threads, or approval-only state.

Keep file-by-file detail out unless the resolution is not obvious.

## Commit Body Section

When committing review-driven fixes, include:

```text
PR comment resolutions:
- <file/comment topic>: <what changed and why>
- <file/comment topic>: <what changed and why>
```

Use the comment topic when there is no stable line number. Focus on reviewer concern and resolution, not an implementation inventory.

## Review Thread Hygiene

- Resolve threads only when the user asks or repo workflow clearly permits it.
- If a thread needs a response instead of a code change, draft the response.
- If a comment is intentionally not addressed, state the reason and risk.

## CI And Checks

- Verify failing checks against the merge target, not only the branch tip.
- If checks cannot be run locally, say why and identify the strongest evidence available.
- Do not claim merge-ready while comments, failing checks, or required approvals remain unresolved.

## Closeout Examples

```text
PR comment resolutions:
- entrypoint orchestration: moved feature workflow into `feature/run.py` so the entrypoint only wires caller IO and persistence.
- cross-runtime adapter: kept the adapter contract stable and delegated implementation to the shared runner.
- eval naming: renamed the eval entrypoint to match repo convention and documented the deterministic scorer rubric.
```
