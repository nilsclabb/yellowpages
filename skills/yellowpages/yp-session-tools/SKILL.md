---
name: yp-session-tools
description: Use when the user asks for yellowpages help, status, loaded context, session metadata, notes, memory updates, reloads, or context compression.
---

# Session Tools Router

Route utility requests about the current session, startup context, notes, and memory files.

## Routing Table

| User intent | Load |
|---|---|
| "what can yellowpages do?", "which skill should I use?" | `yp-help` |
| Current yellowpages/bootstrap/project health | `yp-status` |
| What startup context was injected | `yp-context` |
| Model, context pressure, hook/session metadata | `yp-session` |
| Re-read changed context files mid-session | `yp-reload` |
| Print current notes or `CLAUDE.md` | `yp-notes` |
| Remember a persistent fact | `yp-remember` |
| Forget a persistent fact | `yp-forget` |
| Compress a memory/context file | `yp-compress` |

## Rule

These are diagnostic and memory utilities. Do not route implementation work here unless the user explicitly asks for session/context tooling.
