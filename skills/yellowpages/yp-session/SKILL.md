---
name: yp-session
description: Model info, estimated context pressure, and active hooks for current session.
---

# /yp:session

Session metadata snapshot.

## What to show

- **Model** — state current model identifier
- **Context pressure** — heuristic estimate based on conversation turn count:
  - ≤10 turns: low
  - 11–25 turns: moderate (consider `/yp:compress` on memory files)
  - 26–40 turns: elevated (consider fresh session for complex work)
  - 40+ turns: high (context degradation likely)
  Note: exact token counts are not available to the agent — this is a heuristic only
- **Active hooks** — list from `~/.claude/settings.json` hooks section
- **Caveman mode** — read `~/.claude/.caveman-active`; report current mode or "off"
- **yp-stack version** — read from nearest `yellowpages.config.json` if found in cwd or parent directories
