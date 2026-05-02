---
name: using-yellowpages
description: Use when starting a session with yellowpages; introduces progressive disclosure and routes the agent to the correct category router.
---

<SUBAGENT-STOP>
If you were dispatched as a subagent for a narrow task, skip this skill and execute the task.
</SUBAGENT-STOP>

# Using Yellowpages

Yellowpages is a progressive-disclosure skill library. This bootstrap is loaded at session start so every other skill can stay unloaded until needed.

## Core Rule

Do not preload the library. Pick one category router, load it with the platform's native skill tool, then let that router choose the leaf skill.

## Skill Access

| Platform | How to load skills |
|---|---|
| Claude Code / Cursor | Use the native `Skill` tool |
| Codex | Use native skill discovery from `~/.agents/skills/` |
| Gemini | Use `activate_skill` |
| OpenCode | Use the native `skill` tool |

## Category Routers

| User intent | Load first |
|---|---|
| Normal coding-session work: build, design, plan, execute, verify, review | `yp-workflow` |
| Yellowpages itself: author skills, validate, diagnose, manage skill libraries | `yp-skill-system` |
| Stack/domain guidance: Convex, React, UI, monorepo, preferred stack | `yp-stack-router` |
| Session utilities: help, status, context, notes, reload, compression | `yp-session-tools` |

For factual questions, tiny typo fixes, or explicit user opt-outs, answer directly.

## Context Ladder

```text
using-yellowpages -> category router -> leaf skill -> reference file
```

Load one step at a time. Stop as soon as you have enough context to act.

## Red Flags

| Thought | Reality |
|---|---|
| "I know which leaf skill applies" | Load the category router unless user named the leaf skill directly. |
| "I'll inspect files first" | Load `yp-workflow` or the matching router first. |
| "I'll load INDEX.md" | Use routers first; `INDEX.md` is for maintenance and discovery audits. |
| "I'll load everything" | Never load the full library. |

## Commands

`/yellowpages` and `/yp` are intent shortcuts. They mean: apply this bootstrap and load the smallest relevant category router.
