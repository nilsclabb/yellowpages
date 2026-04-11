# Agents Directory

This directory contains **persona files** — agent definitions that can be loaded into a conversation to give an agent a specific role, identity, and command set.

## What a Persona File Is

A persona is a `.md` file with YAML frontmatter + a markdown body. It is **not** a skill — it does not trigger automatically. Instead, a user or orchestrator loads it explicitly to give the agent a role for a session.

## Persona File Standard

```yaml
---
name: Alice                         # Display name
role: Skill Author                  # One-line role title
description: >                      # What this persona does
  Creates and maintains yellowpages-compliant skills.
whenToUse: >                        # Explicit loading trigger
  Load when authoring or auditing a skill in this repo.
constraints:                        # What this specialist REFUSES to do
  - Never mark a skill complete if any checklist item fails
  - Never create files outside the skill folder structure
commands:
  - name: create-skill
    description: Scaffold a new yellowpages-compliant skill
  - name: audit-skill
    description: Check a skill against yellowpages size and nav rules
---
```

## Body Structure

After the frontmatter, the body (≤ 60 lines) contains:

1. **Persona** — 2–3 sentences on how this agent thinks and communicates
2. **Principles** — 3–5 bullet rules this agent follows without exception
3. **Constraints** — 2–3 things this specialist *refuses* to do (mirrors frontmatter `constraints`)
4. **Workflow** — which skills, workflows, or checklists this agent uses by default
5. **Handoff** — what artifacts this agent produces and who receives them

> The `constraints` key is the most important part of a persona. A specialist who cannot give flattery is structurally different from one who is asked to be critical. Constraints make the behavior structural, not advisory.

## Adding a New Persona

1. Copy the frontmatter template above
2. Name the file `<role-slug>.md` (e.g., `skill-author.md`)
3. Fill in frontmatter + body (≤ 80 lines total)
4. Add a row to `.agents/skills/yellowpages/INDEX.md`
