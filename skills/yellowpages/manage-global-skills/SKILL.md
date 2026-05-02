---
name: manage-global-skills
description: View and manage all globally installed skill libraries — inventory, install, remove, update.
---

# Manage Global Skills

Full inventory and management of globally installed skills. Native host discovery is the source of truth.

## What Claude shows

Group `~/.claude/skills/` contents by library:
- **yellowpages** — skill dirs matching known yellowpages skill names
- **superpowers** — detected via `enabledPlugins` in `~/.claude/settings.json`
- **other** — any remaining dirs

Flag overlaps: same skill name in multiple libraries.

## Available actions

```
[1] Install a skill to ~/.claude/skills/
[2] Remove a skill from ~/.claude/skills/
[3] Update yellowpages (git pull or host plugin update)
[4] View skill details (read SKILL.md of selected skill)
[5] Done
```

## References

| File | When to read |
|---|---|
| `references/scanning.md` | Exact paths to scan and how to identify library ownership |
| `references/actions.md` | Step-by-step for each management action (install/remove/update) |
| `references/sources.md` | Where skills come from — npm, git, local directory |
