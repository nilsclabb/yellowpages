# Recurring PR Patterns

Use this checklist when a branch adds feature-module work behind an agent, tool, command, workflow, or service entrypoint.

## Thin Entrypoints

- Entrypoint files should contain boundary code, user or caller interaction flow, and persistence or dispatch wiring.
- Move feature orchestration and workflow logic into a feature package module such as `<feature>/run.py`.
- The entrypoint should call the shared feature runner instead of duplicating business logic.

## No Demo Or Scratch Code

- Remove fake/demo tools, hardcoded domain data, local-only scripts, scratch files, and ad hoc one-off runners.
- Keep reusable product code, eval entrypoints, and meaningful tests.
- Do not commit scripts whose only value is local manual exploration.

## Clean Diff Discipline

- Inspect shared infra, generated files, storage clients, chat examples, and unrelated docs for accidental edits.
- Revert unrelated changes only when they are yours and clearly accidental.
- Be strict about any diff that would make a reviewer ask, "why did this change?"

## Minimal Cross-Runtime Surfaces

- Keep cross-runtime adapter files and method names as stable contracts.
- Adapter methods should usually be thin wrappers around shared feature runners.
- Target shape: `adapter_method(...) -> await run_feature(...)`, not duplicate implementation.

## Explicit Inputs

- Do not add optional fields or helpers that infer important dates, IDs, scopes, or external resource handles.
- If a feature needs date ranges, entity IDs, tenant scopes, or connection handles, make callers pass them.
- Update all call sites and call out required cross-language or external caller changes before rollout.

## Eval Conventions

- Eval entrypoints should follow the repo naming convention, such as an `eval_*` prefix where that pattern is used.
- Document scorer rubrics enough for reviewers to understand pass/fail logic.
- If using deterministic scorers instead of model-judged scorers, state why and list richer judging as follow-up when useful.

## Output Model Compatibility

- When adapting into shared output models, construct the full current model shape.
- Check against latest base branch because CI may typecheck the merge commit.
- Include every required field, even when the feature only fills a subset of the model.

## Verification

- Run focused tests for deterministic business logic.
- Run local lint, typecheck, and focused test commands matching the changed files.
- If CI fails, inspect the failing GitHub check and fix the branch against latest `main`.
