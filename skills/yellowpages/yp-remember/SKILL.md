---
name: yp-remember
description: Append a persistent note to CLAUDE.md Agent Notes section for future sessions.
---

# Remember Note

Append a fact to CLAUDE.md. Persists across sessions.

## Target file

`CLAUDE.md` in cwd — fall back to `~/CLAUDE.md` if cwd has no CLAUDE.md.

## What to do

1. **`CLAUDE.md` absent** → create file with content: `## Agent Notes\n\n- <fact>\n`
2. **`CLAUDE.md` exists, no `## Agent Notes` section** → append `\n## Agent Notes\n\n- <fact>` to end of file
3. **`## Agent Notes` exists** → append `- <fact>` as new bullet at end of the section
4. **Exact duplicate** (bullet already present with identical text) → no-op; report: "Already noted: '<fact>'"

Confirm success: "Added to Agent Notes: '<fact>'"
