---
name: yp-forget
description: Remove a note from CLAUDE.md Agent Notes section.
---

# Forget Note

Remove a note from CLAUDE.md Agent Notes.

## Target file

Same lookup as `yp-remember` — cwd `CLAUDE.md`, fallback to `~/CLAUDE.md`.

## What to do

1. **`CLAUDE.md` or `## Agent Notes` absent** → "Nothing to forget. No Agent Notes found."
2. **Exact match found** → remove that bullet; if section is now empty → remove the `## Agent Notes` header too; confirm: "Removed: '<fact>'"
3. **No exact match** → fuzzy search among Agent Notes bullets:
   - No fuzzy match → "No note matching '<fact>' found."
   - One fuzzy match → confirm before removing: "Remove: '<found bullet>'? [yes/no]"
   - Multiple fuzzy matches → list all candidates; ask which to remove by number
