# Manage Project — Scanning Reference

## Paths to scan (all relative to cwd)

| Path | Report |
|---|---|
| `.claude-plugin/plugin.json` | Present/absent; if present: name and version |
| `.cursor-plugin/plugin.json` | Present/absent; if present: skills, agents, commands, hooks paths |
| `.opencode/plugins/` | Present/absent; list plugin files |
| `.codex/INSTALL.md` | Present/absent |
| `gemini-extension.json` | Present/absent; if present: contextFileName |
| `.agents/` | Present/absent; if present: list `agents/`, `workflows/`, `checklists/`, `templates/`, `state/` subdirs |
| `.agents/project-context.md` | Present/absent; if present: line count |
| `.agents/ETHOS.md` | Present/absent |
| `CLAUDE.md` | Present/absent; if present: line count, section headings |
| `AGENTS.md` | Present/absent |
| `TASKS.md` | Present/absent; if present: count `[X]`, `[/]`, `[ ]`, `[!]` markers |

## Formatting

Present results in a structured block. Use ✓/✗ for present/absent.
For TASKS.md: show as "[N done · N in-progress · N pending · N blocked]".
