# TASKS.md Format Specification

## File structure

```markdown
# Plan: <description>

_Started: YYYY-MM-DD · Branch: <branch-name>_

## Tasks

- [X] Task 1: <description>
  <optional notes>

- [/] Task 2: <description>
  depends: Task 1
  worktree: <branch-name> · agent started: <ISO timestamp>
  ⚠️  MERGE REQUIRED before marking [X]

- [ ] Task 3: <description>
  depends: Task 1

- [ ] Task 4: <description>
  depends: Task 2, Task 3

- [!] Task 5: <description>
  depends: Task 3
  blocked-reason: <explanation>
```

## Format rules (parser contract)

- **Task names must be unique** within a file — duplicate names break dependency resolution
- **`depends:` is case-sensitive** — value must match task names exactly as written
- **Missing dependency** — if a named dependency doesn't exist in the file, treat task as `[!]` with `blocked-reason: dependency "X" not found`
- **`depends:` is a single comma-separated line** — no multi-line syntax
- **`blocked-reason:` is optional** when state is `[!]` but recommended
- **Indentation** of metadata lines (`depends:`, `worktree:`, `blocked-reason:`) uses exactly 2 spaces
- **Task name extraction** — everything after the state marker and space, up to end of line; strip trailing colon: `- [ ] Task 1: description` → name is `Task 1`

## State machine

`[ ]` → `[/]` (agent claims) → `[X]` (only after worktree merged) → terminal
`[ ]` → `[!]` (blocked) → `[ ]` (human resolves) → `[/]` → `[X]`
