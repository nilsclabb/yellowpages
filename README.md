# Yellowpages

A modular, navigable skill architecture for AI agents. Skills are organized like a phone directory: every entry is a short cover page (≤ 80 lines) that points to the right detail file — never a wall of text.

## Principles

- **Cover-page brevity** — SKILL.md ≤ 80 lines
- **One job per file** — a file routes *or* explains, never both
- **Load on demand** — agents read sub-files only when the task requires it
- **Deep-link navigation** — every reference link includes *when* to read it
- **Self-documenting index** — `INDEX.md` ≤ 30 lines lists every skill + trigger

## Structure

```
.agents/
└── skills/
    └── yellowpages/
        ├── SKILL.md              ← Cover page (≤ 80 lines)
        ├── INDEX.md              ← Master skill listing
        ├── references/
        │   ├── skill-design.md        ← Yellowpages design rules
        │   ├── anatomy.md             ← Skill folder structure
        │   ├── authoring.md           ← Writing SKILL.md files
        │   ├── progressive-disclosure.md ← Splitting content
        │   ├── creation-process.md    ← 6-step skill creation
        │   ├── output-patterns.md     ← Template/example patterns
        │   ├── workflow-patterns.md   ← Sequential/conditional flows
        │   ├── navigation.md          ← Codebase & skill navigation
        │   ├── documentation.md       ← Planning docs standard
        │   ├── agents.md             ← Agent persona standard
        │   ├── workflows.md          ← Step-file workflow standard
        │   ├── state.md              ← Cross-session state tracking
        │   ├── artifact-paths.md     ← Workflow artifact locations
        │   └── learnings.md          ← Session learnings format
        └── scripts/
            ├── init_skill.py          ← Scaffold a new skill
            ├── package_skill.py       ← Package into .skill zip
            └── quick_validate.py      ← Validate skill compliance
```

## Usage

Install skills via the agent runtime (see your host platform's docs). The `yellowpages` skill triggers automatically whenever an agent designs a skill, plans work, or navigates a codebase in this repo.