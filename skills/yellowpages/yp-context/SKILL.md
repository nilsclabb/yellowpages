---
name: yp-context
description: Full transparency view — everything injected into this session at startup.
---

# Context Snapshot

Show everything the agent loaded at session start. Read-only.

## What to show

1. **Bootstrap hook** — list native SessionStart hooks and identify whether `using-yellowpages` is injected
2. **CLAUDE.md** — read from cwd; show section headings + line count. Fall back to `~/CLAUDE.md`.
3. **project-context.md** — if `.agents/project-context.md` exists, show first 15 lines
4. **Installed skills** — list directory names from the host's native skill path
5. **Plugin context** — check `~/.claude/settings.json` enabledPlugins; list any active plugins

Nothing is modified. This is a diagnostic transparency view only.
