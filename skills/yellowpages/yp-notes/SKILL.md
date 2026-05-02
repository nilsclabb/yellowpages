---
name: yp-notes
description: Print current CLAUDE.md contents — make implicit agent memory explicit.
---

# Notes

Print CLAUDE.md. Read-only.

## What to do

1. Check cwd for `CLAUDE.md` — use it if found
2. Fall back to `~/CLAUDE.md` — use it if found
3. If neither found: "No CLAUDE.md found. Use `yp-remember` with the fact to create one."
4. Print full file contents

No modifications made.
