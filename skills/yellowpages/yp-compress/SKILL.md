---
name: yp-compress
description: Rewrite a memory file in terse caveman-style prose to reduce input tokens by ~46%.
command: /yp:compress
argumentHint: "<file>"
---

# /yp:compress <file>

Rewrite a memory file in terse form. Saves original as `<filename>.original.md`.

**Usage:** `/yp:compress CLAUDE.md` or `/yp:compress .agents/project-context.md`

## What Claude does

1. Read `<file>` — if absent, stop and report error
2. If `<filename>.original.md` already exists, ask before overwriting backup
3. Rewrite prose sections per `references/rules.md`
4. Write compressed version to `<file>` (overwrites original)
5. Write original to `<filename>.original.md`
6. Report: "Compressed <file>: [N] → [M] lines ([X]% reduction). Original saved as <filename>.original.md"
7. If reduction < 10%: warn "File already terse — minimal savings achieved."

Retry up to 2x on quality check failure, patching only the failing sections.

## References

| File | When to read |
|---|---|
| `references/rules.md` | Exact rules for what to rewrite vs. what to pass through untouched |
