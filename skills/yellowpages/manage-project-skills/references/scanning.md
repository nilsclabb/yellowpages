# Manage Project — Scanning Reference

## Paths to scan (all relative to cwd)

| Path | Report |
|---|---|
| `yellowpages.config.json` | Present/absent; if present: platform, scope, version, installedAt |
| `.agents/` | Present/absent; if present: list `skills/`, `workflows/`, `checklists/`, `templates/`, `state/` subdirs |
| `.agents/skills/` | List all skill directory names |
| `.agents/project-context.md` | Present/absent; if present: line count |
| `.agents/ETHOS.md` | Present/absent |
| `CLAUDE.md` | Present/absent; if present: line count, section headings |
| `AGENTS.md` | Present/absent |
| `TASKS.md` | Present/absent; if present: count `[X]`, `[/]`, `[ ]`, `[!]` markers |

## Formatting

Present results in a structured block. Use ✓/✗ for present/absent.
For TASKS.md: show as "[N done · N in-progress · N pending · N blocked]".
