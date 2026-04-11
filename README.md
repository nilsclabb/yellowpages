# Yellowpages

A modular, navigable skill architecture for AI agents. Skills are organized like a phone directory: every entry is a short cover page (≤ 80 lines) that points to the right detail file — never a wall of text.

## Principles

- **Cover-page brevity** — SKILL.md ≤ 80 lines
- **One job per file** — a file routes *or* explains, never both
- **Load on demand** — agents read sub-files only when the task requires it
- **Deep-link navigation** — every reference link includes *when* to read it
- **Self-documenting index** — `INDEX.md` ≤ 30 lines lists every skill + trigger

## Skills

| Skill | Purpose |
|---|---|
| `yellowpages` | The meta-standard itself — skill design, navigation, documentation |
| `skill-creator` | How to create, author, and package skills |

## Structure

```
.agents/
└── skills/
    ├── yellowpages/          ← Meta-skill (this standard)
    │   ├── SKILL.md
    │   ├── INDEX.md          ← Master skill listing
    │   └── references/
    │       ├── skill-design.md
    │       ├── navigation.md
    │       └── documentation.md
    └── skill-creator/        ← Skill authoring tool
        ├── SKILL.md
        ├── references/
        │   ├── anatomy.md
        │   ├── authoring.md
        │   ├── progressive-disclosure.md
        │   ├── workflow.md
        │   └── output-patterns.md
        └── scripts/
            ├── init_skill.py
            ├── package_skill.py
            └── quick_validate.py
```

## Usage

Install skills via the agent runtime (see your host platform's docs). The `yellowpages` skill triggers automatically whenever an agent designs a skill, plans work, or navigates a codebase in this repo.