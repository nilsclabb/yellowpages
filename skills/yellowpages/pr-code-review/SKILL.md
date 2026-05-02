---
name: pr-code-review
description: Specialized review leaf for PR, branch, and diff review. Use from `yp-workflow-review` when the user explicitly wants PR-oriented review or merge-readiness analysis.
---

# PR Code Review

This is the specialized PR-oriented branch of `yp-workflow-review`.

## Use When

- the user asks to review a PR, branch, or diff
- merge readiness matters
- review comments need to be paste-ready

## Hard Rules

- start from branch evidence: status, diff, comments, checks
- lead with bugs, regressions, risks, and missing verification
- never approve, request changes, push, or resolve threads unless asked

## Reference Map

| When you need to... | Read |
|---|---|
| Run the end-to-end review workflow | [references/workflow.md](references/workflow.md) |
| Check recurring review mistakes | [references/recurring-patterns.md](references/recurring-patterns.md) |
| Write terse paste-ready comments | [references/comment-style.md](references/comment-style.md) |
| Summarize fixes, tests, and blockers | [references/closeout.md](references/closeout.md) |
