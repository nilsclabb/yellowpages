# State Directory

This directory holds **persistent state** that agents write to and read from across sessions. Unlike conversation artifacts (which live in the AI tool's brain directory), state here is part of the repo and survives beyond any single session.

## Structure

```
.agents/state/
├── README.md                        ← this file
├── learnings.jsonl                  ← cross-session agent learnings (append-only)
└── gates/
    └── <workflow-name>.json         ← gate tracking per workflow run
```

## Rules

- **`learnings.jsonl`** — append-only. Never delete entries. Read at session start to resume with accumulated knowledge.
- **`gates/`** — one JSON file per workflow, overwritten on each run. Tracks which review gates have passed.
- Do not create subdirectories here except `gates/`.
- Do not store large artifacts here — those go in the conversation's artifact directory.

## Reading State at Session Start

1. Read `learnings.jsonl` (last 20 lines) to load recent patterns for this repo
2. Read the relevant `gates/<workflow>.json` if resuming a workflow
