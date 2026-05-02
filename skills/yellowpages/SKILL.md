---
name: yellowpages
description: The yellowpages skill defines how agents should create, author, and package skills, structure skills for navigation, navigate between skills and documentation, document planning work, define agent personas, run and track multi-step workflows, track state across sessions, and accumulate cross-session learnings. Use this skill when: creating a new skill, scaffolding a skill, authoring or packaging a skill, updating an existing skill, designing skill navigation systems, deciding how to split skill content into sub-files, writing SKILL.md frontmatter or body, documenting planning work (implementation plans, task lists, walkthroughs), defining an agent persona or specialist role, building a step-file workflow, tracking workflow state or gate status, reading or writing session learnings, or navigating a large codebase or skillbase efficiently.
---

# Yellowpages

The yellowpages system is the complete standard for how skills are created, authored, packaged, navigated, and maintained. It also covers agents, workflows, documentation, state, and codebase navigation. Every entry is a short cover page that points you to the right place — not the full story.

## The 5 Rules

| Rule | Requirement |
|---|---|
| **Cover-page brevity** | Every SKILL.md ≤ 80 lines |
| **One job per file** | A file either *routes* or *explains* — never both |
| **Load on demand** | Read sub-files only when the task requires that branch |
| **Deep-link navigation** | Every reference listed with *when* to read it |
| **Layered routing** | Bootstrap → category router → leaf skill → reference |

## Reference Map — Skill Creation & Authoring

| When you need to... | Read |
|---|---|
| Follow the 6-step skill creation process | [references/creation-process.md](references/creation-process.md) |
| Understand skill folder structure and resource types | [references/anatomy.md](references/anatomy.md) |
| Design a new yellowpages-compliant skill | [references/skill-design.md](references/skill-design.md) |
| Write SKILL.md frontmatter and body instructions | [references/authoring.md](references/authoring.md) |
| Split skill content across multiple files | [references/progressive-disclosure.md](references/progressive-disclosure.md) |
| Use template or example patterns for consistent output | [references/output-patterns.md](references/output-patterns.md) |
| Structure sequential or conditional flows in a skill | [references/workflow-patterns.md](references/workflow-patterns.md) |

## Reference Map — Navigation, Workflows & State

| When you need to... | Read |
|---|---|
| Navigate between skills, docs, or codebase files | [references/navigation.md](references/navigation.md) |
| Document planning work (plans, tasks, walkthroughs) | [references/documentation.md](references/documentation.md) |
| Define an agent persona or specialist role | [references/agents.md](references/agents.md) |
| Build or follow a step-file workflow | [references/workflows.md](references/workflows.md) |
| Track workflow state across sessions | [references/state.md](references/state.md) |
| Write or read workflow artifact output paths | [references/artifact-paths.md](references/artifact-paths.md) |
| Log or read cross-session learnings | [references/learnings.md](references/learnings.md) |
| Look up a yellowpages term or concept | [references/encyclopedia.md](references/encyclopedia.md) |

## Quick Start — Create a Skill

```bash
python scripts/init_skill.py <skill-name> --path <output-directory>
```

For the full 6-step process, read [references/creation-process.md](references/creation-process.md).

## Runtime Routing

Session start loads `using-yellowpages`, which routes to category routers. Use `INDEX.md` for audits and maintenance, not normal runtime routing.

## Session Start Protocol

1. Load `using-yellowpages`
2. Pick one category router
3. Load one leaf skill
4. Follow only the reference branch required
