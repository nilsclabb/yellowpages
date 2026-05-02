---
name: yp-status
description: Current session snapshot — yellowpages bootstrap, active skills, project context, and hook health.
---

# Status

Session snapshot. Read-only.

## What to show

1. **Bootstrap** — confirm `using-yellowpages` is present and describe whether it was injected this session
2. **Hooks** — list native SessionStart hooks visible to the host
3. **Skills** — confirm `skills/yellowpages/INDEX.md` and key skills are present
4. **Project** — `.agents/` present?, `CLAUDE.md` present?, `TASKS.md` state if present
5. **Plugin files** — check `.claude-plugin/`, `.cursor-plugin/`, `.opencode/`, `.codex/`, and `gemini-extension.json`

Format as a compact table per section. If anything is missing or unreadable, append: "Run `yp-diagnose` to check and repair."
