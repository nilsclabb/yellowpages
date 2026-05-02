# Yellowpages — Agent Instructions

Read `.agents/project-context.md` first, then `.agents/ETHOS.md`.

## Quick Orientation

This repo IS the yellowpages skill system. It contains:

- **`skills/yellowpages/`** — all installable skills (single source of truth)
- **`.agents/`** — governance layer (workflows, checklists, templates, state)
- **`.claude-plugin/`, `.cursor-plugin/`, `.opencode/`, `.codex/`, `gemini-extension.json`** — native host install surfaces
- **`hooks/`** — SessionStart bootstrap hook that injects only `using-yellowpages`

## Key Rules

1. **One source of truth**: all skills live in `skills/yellowpages/`. Never duplicate into `.agents/`.
2. **No custom installer**: do not recreate `packages/yp-stack/`; use native plugin/skill discovery.
3. **Runtime bootstrap**: SessionStart injects only `skills/yellowpages/using-yellowpages/SKILL.md`.
4. **Skill file limits**: SKILL.md ≤ 80 lines, reference files ≤ 100 lines, one job per file.
5. **Commands are intent shortcuts**: keep chat commands in `commands/`; do not mirror every skill as a command.
6. **Router ladder**: runtime routing is bootstrap → category router → leaf skill → reference.

## Navigation

- Runtime bootstrap: `skills/yellowpages/using-yellowpages/SKILL.md`
- Category routers: `yp-workflow`, `yp-skill-system`, `yp-stack-router`, `yp-session-tools`
- Skill audit index: `skills/yellowpages/INDEX.md`
- Governance: `.agents/project-context.md` → `.agents/ETHOS.md`
