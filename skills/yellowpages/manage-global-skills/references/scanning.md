# Manage Global — Scanning Reference

## Paths to scan

| Path | What it contains |
|---|---|
| `~/.claude/skills/` | All globally installed skill directories |
| `~/.claude/settings.json` → `enabledPlugins` | Active plugins (e.g. superpowers) |
| `~/.claude/plugins/cache/` | Installed plugin directories (version + skills) |

## Identifying library ownership

**yellowpages skills** — library directory is named `yellowpages`, or a skill path resolves under an installed `yellowpages/skills/yellowpages` tree.

**superpowers skills** — `enabledPlugins` contains a key matching `superpowers@*`;
skills are in `~/.claude/plugins/cache/claude-plugins-official/superpowers/<version>/skills/`

**other** — anything in `~/.claude/skills/` not matching the above

## Overlap detection

Two skills overlap if their directory names are identical. Report as:
`⚠ overlap: <name> (yellowpages + superpowers)`
