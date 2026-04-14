# Yellowpages — Agent Instructions

Read `.agents/project-context.md` first, then `.agents/ETHOS.md`.

## Quick Orientation

This repo IS the yellowpages skill system. It contains:

- **`skills/yellowpages/`** — all installable skills (single source of truth)
- **`.agents/`** — governance layer (workflows, checklists, templates, state)
- **`packages/yp-stack/`** — NPM installer that bundles both for distribution
- **`hooks/`** — SessionStart hooks (skills-manifest, caveman)

## Key Rules

1. **One source of truth**: all skills live in `skills/yellowpages/`. Never duplicate into `.agents/`.
2. **After editing skills**: run `npm run bundle` in `packages/yp-stack/` to regenerate the installer bundle.
3. **After editing `packages/yp-stack/`**: run `bun lint && bun fmt:check` before marking done.
4. **Skill file limits**: SKILL.md ≤ 80 lines, reference files ≤ 100 lines, one job per file.
5. **Bundler reads from**: `skills/` (skill content) + `.agents/` minus `.agents/skills/` (governance).

## Navigation

- Skill discovery: `skills/yellowpages/INDEX.md`
- Utility commands: `skills/yellowpages/SKILLS-INDEX.md`
- Governance: `.agents/project-context.md` → `.agents/ETHOS.md`
