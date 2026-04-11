---
name: skill-creator
description: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.
license: Complete terms in LICENSE.txt
---

# Skill Creator

Skills are modular packages that extend an agent's capabilities with specialized workflows, domain knowledge, and bundled resources. Think of them as "onboarding guides" — they give another Claude instance procedural knowledge no model fully possesses by default.

## Core Principles

- **Concise is key** — the context window is shared. Only add what Claude doesn't already know.
- **Set appropriate freedom** — high freedom (open text) for flexible tasks; low freedom (scripts) for fragile, error-prone sequences.
- **Progressive disclosure** — keep SKILL.md lean; load details only when needed via reference files.

> Skills in this repo follow the **yellowpages standard**: SKILL.md ≤ 80 lines. Details live in references. See `.agents/skills/yellowpages/SKILL.md`.

## Reference Map

Read these only when the task requires that branch:

| When you need to... | Read |
|---|---|
| Understand skill folder structure & resource types | [references/anatomy.md](references/anatomy.md) |
| Write frontmatter or body instructions | [references/authoring.md](references/authoring.md) |
| Split content across multiple files | [references/progressive-disclosure.md](references/progressive-disclosure.md) |
| Follow the 6-step creation process | [references/workflow.md](references/workflow.md) |
| See output format & example patterns | [references/output-patterns.md](references/output-patterns.md) |

## Quick Start

Creating a skill involves 6 steps: **understand → plan → init → edit → package → iterate**.

For the full process, read [references/workflow.md](references/workflow.md).

To initialize a new skill directory from a template:

```bash
python scripts/init_skill.py <skill-name> --path <output-directory>
```

To package a finished skill:

```bash
python scripts/package_skill.py <path/to/skill-folder>
```
