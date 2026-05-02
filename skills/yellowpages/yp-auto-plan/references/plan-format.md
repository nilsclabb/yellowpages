# Auto-Plan — Plan Format

- [Location](#location)
- [Plan Document Header](#plan-document-header)
- [File Structure Section](#file-structure-section)
- [Task Template](#task-template-tdd-shaped)
## Location

Write the plan to `docs/plans/YYYY-MM-DD-<feature>.md`. Create `docs/plans/` if it does not exist.

Always produce both: the plan document (for humans) AND `TASKS.md` at the project root (for `yp-tasks` pickup).

## Plan Document Header

Every plan starts with this header:

```markdown
# <Feature Name> Implementation Plan

_Spec: [<spec-filename>](../specs/<spec-filename>.md)_ · _Date: YYYY-MM-DD_

> **For agents:** Use `yp-tasks pickup` to claim and execute tasks in order. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** <one sentence describing what this builds>

**Architecture:** <2–3 sentences about the approach>

**Tech Stack:** <key technologies / libraries>

---
```

## File Structure Section

Before defining tasks, list every file that will be created or modified and what each one is responsible for. Use `Create: <path> — <responsibility>`, `Modify: <path>:<lines> — <responsibility>`, `Test: <path> — <what it covers>`. Design units with clear boundaries; one responsibility per file; files that change together live together.

## Task Template (TDD-shaped)

Each task has bite-sized steps (2–5 min each):

````markdown
### Task N: <Component Name>

**Files:**
- Create: `exact/path/to/file.ts`
- Modify: `exact/path/to/existing.ts:123-145`
- Test: `tests/exact/path/to/test.ts`

- [ ] **Step 1: Write the failing test**

```ts
test("specific behavior", () => {
  const result = fn(input);
  expect(result).toBe(expected);
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `bun test tests/path/test.ts`
Expected: FAIL — `fn is not defined`

- [ ] **Step 3: Write minimal implementation**

```ts
export function fn(input: Input): Output {
  return expected;
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `bun test tests/path/test.ts`
Expected: PASS

- [ ] **Step 5: Commit** — stage touched files and commit with a message focused on the behavior added.
````

## No-Placeholder Rules

These patterns are plan failures. Never write them:

- `TBD`, `TODO`, `implement later`, `fill in details`
- `add appropriate error handling`, `add validation`, `handle edge cases` (show the code)
- `write tests for the above` without actual test code
- `similar to Task N` (repeat the code — agents may read tasks out of order)
- Steps that describe what to do without showing how
- References to types, functions, or methods not defined in any task

## Self-Review

After writing the full plan, re-read with fresh eyes:

1. **Spec coverage** — every spec section has a task that implements it; list any gaps
2. **Placeholder scan** — search for the red flags above; fix them
3. **Type consistency** — method signatures, property names, and types match across tasks

Fix issues inline. If a spec requirement has no task, add the task.
