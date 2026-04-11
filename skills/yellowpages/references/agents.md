# Agents (Persona Files)

This file defines the yellowpages standard for agent persona files.

## What a Persona File Is

Persona files define **who an agent is** for a specific session. Unlike skills (which trigger automatically), personas are loaded explicitly by a user or orchestrator to give the agent a role, identity, and default command set.

Personas live in `.agents/agents/`.

## Frontmatter Standard

```yaml
---
name: Alice                         # Display name
role: Skill Author                  # One-line role
description: >                      # What this persona does
  [2–3 sentences on capabilities]
whenToUse: >                        # When to load this persona
  Load when [specific context].
commands:
  - name: command-name
    description: What it does
---
```

**Only these YAML keys are valid:** `name`, `role`, `description`, `whenToUse`, `commands`.

## Body Standard (≤ 60 lines)

After frontmatter:
1. **Persona** — How this agent thinks and communicates (2–3 sentences)
2. **Principles** — 3–5 non-negotiable rules this agent follows
3. **Default Workflow** — Which skills, workflows, or checklists it uses by default
4. **Handoff** — What artifacts it produces and who/what receives them

## When to Create a Persona vs. a Skill

**Create a persona** when you need a role-specific identity: a named agent with principles, a communication style, and a default workflow. Personas are session-scoped.

**Create a skill** when you need repeatable procedural knowledge that any agent should be able to use. Skills persist across sessions and are not role-specific.

## Example

See `.agents/agents/skill-author.md` for a complete persona example.
