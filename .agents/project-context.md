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
.agents/
├── project-context.md    ← this file (read first)
├── ETHOS.md              ← builder philosophy (read second)
├── agents/               ← persona definitions
├── workflows/            ← step-file workflows
├── checklists/           ← quality verification lists
├── templates/            ← document scaffolds
├── state/                ← persistent cross-session state (learnings, gates)
└── skills/               ← installable skills (yellowpages)
```

## Navigation Protocol

1. Read `project-context.md` (this file) first
2. Check `.agents/skills/yellowpages/INDEX.md` to locate the right skill
3. Read that skill's `SKILL.md` cover page
4. Follow only the reference branch your task requires
5. For workflow tasks, enter the relevant `workflows/` step-file sequence

## Global Constraints

- Do not create files inside `.agents/skills/` that are not `SKILL.md`, `INDEX.md`, or inside `references/`, `scripts/`, or `assets/`
- Do not create auxiliary docs (README, CHANGELOG, INSTALLATION_GUIDE) inside skill folders
- Scratch files go in the conversation's `scratch/` directory, not in the repo
- Append session learnings to `.agents/state/learnings.jsonl` at the end of any session where meaningful work was done
- Write gate status to `.agents/state/gates/<workflow>.json` after any multi-step workflow completes
- Caveman terse mode is active by default. See `.agents/skills/yellowpages/caveman/SKILL.md` to toggle or read about intensity levels.
- Before any task touching `packages/yp-stack/` is marked complete, run `bun lint && bun fmt:check` inside that package and confirm clean output

## React Coding Rules

- **Do not use `useEffect` to sync server data into form state.** Use key-based remounting instead: extract a dedicated edit-form component, pass server data as `initialData`, and key it on the entity ID. See skill for full rationale, before/after code, and edge cases: [`.agents/skills/yellowpages/react-patterns/SKILL.md`](.agents/skills/yellowpages/react-patterns/SKILL.md)
