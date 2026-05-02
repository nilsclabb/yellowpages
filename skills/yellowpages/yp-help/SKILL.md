---
name: yp-help
description: Use when the user asks what yellowpages can do or how to find the right yellowpages skill.
---

# Yellowpages Help

Quick reference for yellowpages native skill usage.

## Runtime Model

Only `using-yellowpages` is injected at session start. Everything else is loaded on demand through the platform's native skill tool.

## Chat Commands

| Command | What it means |
|---|---|
| `/yellowpages` | Route the current request through yellowpages |
| `/yp` | Alias for `/yellowpages` |

Commands are intent shortcuts, not the skill registry.

## Core Skills

| Need | Skill |
|---|---|
| Choose the right skill | `using-yellowpages` |
| Create or maintain skills | `yellowpages` |
| Design before building | `yp-brainstorm` |
| Turn approved specs into plans | `yp-auto-plan` |
| Execute task files | `yp-tasks` |
| Verify before completion claims | `yp-verify` |
