# Step-File Workflows

This file defines the yellowpages standard for multi-step workflows.

## What a Workflow Is

A workflow is a multi-step process broken into individual markdown files, one per step. Each step is loaded just-in-time — the agent reads only the current step, not the entire sequence. This keeps context lean for long processes.

Workflows live in `.agents/workflows/<workflow-name>/`.

## File Structure

```
workflows/<name>/
├── WORKFLOW.md           ← ≤ 30 lines: overview + ordered step list
├── step-01-<name>.md     ← ≤ 50 lines per step
├── step-02-<name>.md
└── step-0N-<name>.md
```

## Step File Rules

- Every step file is ≤ 50 lines
- Every step opens with: `Context: [one line — what was done before]`
- Every step ends with: `nextStep: step-0N+1-<name>.md` (except the final step)
- Each step has exactly one **Goal** and one defined **Output**

## State Tracking

When a workflow generates an artifact (a document, plan, etc.), the artifact should track workflow progress in its YAML frontmatter. Read [state.md](state.md) for the full state pattern.

## Starting a Workflow

Read the `WORKFLOW.md` first to see all steps, then open `step-01-*.md` and follow `nextStep` pointers sequentially.

## Available Workflows

| Workflow | Produces |
|---|---|
| [create-skill](../../workflows/create-skill/WORKFLOW.md) | A new yellowpages-compliant skill |
