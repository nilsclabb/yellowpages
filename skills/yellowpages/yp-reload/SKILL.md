---
name: yp-reload
description: Re-read CLAUDE.md and installed skills state into conversation context via tool use.
command: /yp:reload
---

# /yp:reload

Re-read current state files and report. SessionStart hooks cannot re-fire mid-session — this command uses tool use to read the files directly and show their current state.

## What to do

1. Read `CLAUDE.md` from cwd (fallback to `~/CLAUDE.md`) — show section headings + line count
2. Read `~/.claude/skills/` — list all installed skill directory names grouped by library
3. Read `.agents/project-context.md` if present — show first 10 lines
4. Read `~/.claude/.caveman-active` — report current caveman mode
5. Report summary: "State refreshed. [N] global skills visible. CLAUDE.md: [N] lines. Caveman: [mode]."

This shows *current* file state. If files changed since session start (e.g. after editing CLAUDE.md), this reflects those changes. The session-start injected context is not updated.
