# Project Context

This file is the "constitution" for all agents working in this repo. Read it at the start of any session before reading skills or taking action.

**Before taking any action**, also read:
- `.agents/ETHOS.md` — the 4 builder principles that govern all work here
- Last 20 lines of `.agents/state/learnings.jsonl` — accumulated repo-specific knowledge (if the file exists)

## What This Repo Is

**Yellowpages** is a publishable skill system for AI agents. It defines standards for how agents: author skills, navigate codebases and documentation, document their planning work, track workflow state, and coordinate across multiple structured files.

## The Yellowpages Rules (Non-Negotiable)

1. Every `SKILL.md` is a cover page — ≤ 80 lines
2. Every reference/sub-file does one job — ≤ 100 lines
3. Files either *route* or *explain* — never both
4. Every cross-reference includes *when* to read it — not just a bare link
5. Load only what the current task requires — no speculative reads

## Repo Layout

```
skills/
└── yellowpages/          ← ALL installable skills (single source of truth)
    ├── SKILL.md          ← main cover page
    ├── INDEX.md          ← skill discovery index
    ├── using-yellowpages/← runtime bootstrap skill
    ├── yp-workflow/      ← coding-session workflow router
    ├── yp-skill-system/  ← yellowpages/skill maintenance router
    ├── yp-stack-router/  ← stack/domain router
    ├── yp-session-tools/ ← session/context utility router
    ├── references/       ← core yellowpages reference files
    ├── scripts/          ← Python utilities
    └── <skill-name>/     ← individual skill directories

.agents/
├── project-context.md    ← this file (read first)
├── ETHOS.md              ← builder philosophy (read second)
├── agents/               ← persona definitions
├── workflows/            ← step-file workflows
├── checklists/           ← quality verification lists
├── templates/            ← document scaffolds
└── state/                ← persistent cross-session state (learnings, gates)

.claude-plugin/           ← Claude plugin metadata
.cursor-plugin/           ← Cursor plugin metadata
.opencode/                ← OpenCode plugin entrypoint
.codex/                   ← Codex native discovery install instructions
hooks/                    ← SessionStart bootstrap hook
commands/                 ← High-level chat command aliases only
```

## Navigation Protocol

1. Runtime starts with `skills/yellowpages/using-yellowpages/SKILL.md`
2. Load one category router
3. Load one leaf skill from that router
4. Follow only the reference branch the leaf skill requires
5. Use `INDEX.md` for audits/maintenance, not normal runtime routing

## Global Constraints

- Do not create files inside `skills/yellowpages/` that are not `SKILL.md`, `INDEX.md`, or inside `references/`, `scripts/`, or `assets/`
- Do not create auxiliary docs (README, CHANGELOG, INSTALLATION_GUIDE) inside skill folders
- Scratch files go in the conversation's `scratch/` directory, not in the repo
- Append session learnings to `.agents/state/learnings.jsonl` at the end of any session where meaningful work was done
- Write gate status to `.agents/state/gates/<workflow>.json` after any multi-step workflow completes
- Runtime context must stay lean: inject only `skills/yellowpages/using-yellowpages/SKILL.md`; load all other skills on demand.
- Do not recreate the removed custom installer. Native plugin/skill discovery is the install model.
- **Skills single source of truth**: all skills live in `skills/yellowpages/`. Never duplicate skills into `.agents/`.

## React Coding Rules

- **Do not use `useEffect` to sync server data into form state.** Use key-based remounting instead: extract a dedicated edit-form component, pass server data as `initialData`, and key it on the entity ID. See skill: [`skills/yellowpages/react-patterns/SKILL.md`](../../skills/yellowpages/react-patterns/SKILL.md)
