# Workflows Directory

This directory contains **step-file workflows** — multi-step processes broken into individual, sequentially-loaded markdown files. Each step is loaded just-in-time so the agent never holds the full workflow in context at once.

## Workflow Folder Standard

Each workflow lives in its own subdirectory:

```
workflows/
└── <workflow-name>/
    ├── WORKFLOW.md           ← ≤ 30 lines: overview + ordered step list
    ├── step-01-<name>.md     ← First step (≤ 50 lines)
    ├── step-02-<name>.md
    └── step-0N-<name>.md     ← Last step (no nextStep pointer)
```

## WORKFLOW.md Format

```markdown
# Workflow: <Name>

[1–2 line description of what this workflow produces]

## Steps

1. [step-01-name.md] — Brief step description
2. [step-02-name.md] — Brief step description
3. [step-03-name.md] — Brief step description

## Load

Start by reading `step-01-<name>.md`.
```

## Step File Format

Each step file (≤ 50 lines) contains:

```markdown
# Step N — <Name>
[Context: what was done before this step, 1 line]

## Goal
[What this step produces]

## Instructions
[Numbered steps — imperative form]

## Output
[What artifact or decision exits this step]

nextStep: step-0N+1-<name>.md
```

- The `nextStep:` line is **always the last line** of every step file except the final one.
- The final step omits `nextStep:` — its completion is the workflow's exit condition.

## State Tracking

Any artifact produced by a workflow should carry its progress in YAML frontmatter. See `.agents/skills/yellowpages/references/state.md` for the full state tracking standard.

## Adding a New Workflow

1. Create a folder: `workflows/<workflow-name>/`
2. Write `WORKFLOW.md` (≤ 30 lines)
3. Write step files in order (≤ 50 lines each)
4. Add to `INDEX.md`
