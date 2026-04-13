---
name: yp-status
description: Current session snapshot — caveman mode, active skills, project context, hook health.
---

# /status

Session snapshot. Read-only.

## What to show

1. **Caveman** — read `~/.claude/.caveman-active`; report mode (full/lite/ultra) or "off"
2. **Hooks** — read `~/.claude/settings.json` hooks section; list registered SessionStart and UserPromptSubmit commands
3. **Skills manifest** — report from session-start context (already injected by skills-manifest.js)
4. **Project** — `.agents/` present?, `CLAUDE.md` present?, `TASKS.md` state if present
5. **Hook health** — verify `~/.claude/hooks/caveman-activate.js` and `~/.claude/hooks/skills-manifest.js` are readable

Format as a compact table per section. If anything is missing or unreadable, append: "Run `/diagnose` to check and repair."
