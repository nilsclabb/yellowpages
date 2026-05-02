---
name: yp-session
description: Model info, estimated context pressure, and active hooks for current session.
---

# Session Snapshot

Session metadata snapshot.

## What to show

- **Model** — state current model identifier
- **Context pressure** — heuristic estimate based on conversation turn count:
  - ≤10 turns: low
  - 11–25 turns: moderate (consider `yp-compress` on memory files)
  - 26–40 turns: elevated (consider fresh session for complex work)
  - 40+ turns: high (context degradation likely)
  Note: exact token counts are not available to the agent — this is a heuristic only
- **Active hooks** — list from `~/.claude/settings.json` hooks section
- **Bootstrap hook** — report whether `hooks/session-start` is present in the installed plugin
- **yellowpages version** — read from the nearest native plugin manifest when available
