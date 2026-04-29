---
name: pr-code-review
description: >
  Review pull requests and branches for recurring team mistakes, review-comment
  quality, clean diffs, tests, CI readiness, and PR closeout. Use when: reviewing
  a PR, auditing a branch, resolving anticipated PR comments, making a branch
  review-ready, checking for recurring review patterns, or invoking /pr-code-review.
command: /pr-code-review
---

# PR Code Review

Review branches for correctness, recurring review failures, and merge readiness. Prefer actionable findings over commentary; fix code only when the user explicitly asks for fixes.

## Hard Rules

- Start from branch evidence: status, diff against base, review comments, and checks when available.
- Lead with bugs, regressions, risks, and missing verification.
- Keep review comments paste-ready: location, problem, fix.
- Never approve, request changes, push, or resolve threads unless the user asks.

## Reference Map

| When you need to... | Read |
|---|---|
| Run the end-to-end review workflow | [references/workflow.md](references/workflow.md) |
| Check recurring feature-module PR mistakes | [references/recurring-patterns.md](references/recurring-patterns.md) |
| Write terse paste-ready review comments | [references/comment-style.md](references/comment-style.md) |
| Summarize fixes, tests, CI, and PR comment resolutions | [references/closeout.md](references/closeout.md) |

## Output Contract

For review-only requests, return findings first, ordered by severity, then questions, then verification gaps. For fix requests, report what changed, which comments it addresses, tests run, CI status, and remaining blockers.
