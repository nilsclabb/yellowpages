# PR Review Workflow

Use this when the user asks to review a PR, audit a branch, or make work review-ready.

## 1. Establish Scope

1. Identify base branch and current branch.
2. Inspect status, staged changes, untracked files, and diff.
3. If a PR exists, inspect title, body, review comments, changed files, and failing checks.
4. Separate feature changes from accidental or unrelated diffs.

Do not assume the latest commit is the whole PR. Review every commit and file that will be included.

## 2. Audit Behavior

Prioritize findings in this order:

1. Broken behavior, regressions, data loss, security, or production risk.
2. Architectural drift from established project patterns.
3. Missing tests, missing verification, or CI mismatch.
4. Maintainability issues that will likely cause repeated mistakes.
5. Nits only when they block clarity or consistency.

## 3. Apply Recurring Checks

Read [recurring-patterns.md](recurring-patterns.md) when the branch touches feature modules, agent/tool entrypoints, cross-runtime wrappers, evals, or shared output models.

Look for repeated mistakes before inventing new review categories. If the branch matches a known pattern, name the pattern in your finding or fix summary.

## 4. Decide Review vs Fix

- If the user asked for review: do not edit code. Return paste-ready findings.
- If the user asked to fix: make the smallest scoped changes that resolve the review issue.
- If a fix requires product judgment, ask before changing behavior.
- Never revert unrelated user work without explicit approval.

## 5. Verify

Run focused deterministic tests first, then lint/typecheck commands appropriate to the changed files. If CI fails, inspect the failing check and fix against latest base branch behavior.

## 6. Report

Lead with findings or fixes. Include tests run, checks not run, CI status, unresolved comments, and blockers. Keep summaries short unless reviewers need context.
