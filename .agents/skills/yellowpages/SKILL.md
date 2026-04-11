---
name: yellowpages
description: The yellowpages skill defines how agents should structure skills, navigate between skills and documentation, document their planning work, define agent personas, run and track multi-step workflows, track state across sessions, and accumulate cross-session learnings. Use this skill when: creating or updating any skill in this repo, designing skill navigation systems, deciding how to split skill content into sub-files, documenting planning work (implementation plans, task lists, walkthroughs), defining an agent persona or specialist role, building a step-file workflow, tracking workflow state or gate status, reading or writing session learnings, or navigating a large codebase or skillbase efficiently.
---

# Yellowpages

The yellowpages system is the meta-standard for how skills, agents, workflows, documentation, state, and codebase navigation work in this repo. Every entry is a short cover page that points you to the right place — not the full story.

## The 5 Rules

| Rule | Requirement |
|---|---|
| **Cover-page brevity** | Every SKILL.md ≤ 80 lines |
| **One job per file** | A file either *routes* or *explains* — never both |
| **Load on demand** | Read sub-files only when the task requires that branch |
| **Deep-link navigation** | Every reference listed with *when* to read it |
| **Self-documenting index** | `INDEX.md` ≤ 30 lines lists every item + trigger |

## Reference Map

| When you need to... | Read |
|---|---|
| Design a new yellowpages-compliant skill | [references/skill-design.md](references/skill-design.md) |
| Navigate between skills, docs, or codebase files | [references/navigation.md](references/navigation.md) |
| Document planning work (plans, tasks, walkthroughs) | [references/documentation.md](references/documentation.md) |
| Define an agent persona or specialist role | [references/agents.md](references/agents.md) |
| Build or follow a step-file workflow | [references/workflows.md](references/workflows.md) |
| Track workflow state across sessions | [references/state.md](references/state.md) |
| Write or read workflow artifact output paths | [references/artifact-paths.md](references/artifact-paths.md) |
| Log or read cross-session learnings | [references/learnings.md](references/learnings.md) |

## Repo Index

Read [INDEX.md](INDEX.md) to discover all skills, agents, workflows, checklists, and templates in this repo.

## Session Start Protocol

1. Read `.agents/project-context.md` (repo constitution)
2. Read `.agents/ETHOS.md` (builder principles)
3. Read last 20 lines of `.agents/state/learnings.jsonl` if it exists
4. Check `INDEX.md` to find the right skill or workflow
5. Read that item's cover page
6. Follow only the branch your task requires
