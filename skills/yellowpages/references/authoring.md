# Authoring Guidelines

## Frontmatter

```yaml
---
name: skill-name
description: <comprehensive trigger + scope description>
---
```

**Valid fields:** `name` (required), `description` (required). Host-specific metadata belongs in plugin manifests or `commands/`, not skill frontmatter.

### Writing a Good Description

The description is the discovery API. Make it do two jobs:

1. **What it does** — the skill's domain and capabilities
2. **When to use it** — explicit trigger phrases and contexts

**Example (docx skill):**
```
Comprehensive document creation, editing, and analysis with support for tracked
changes, comments, formatting preservation, and text extraction. Use when Claude
needs to work with professional documents (.docx files) for: (1) Creating new
documents, (2) Modifying or editing content, (3) Working with tracked changes,
(4) Adding comments, or any other document tasks.
```

Do **not** put "When to Use This Skill" sections in the body — the body is only loaded after triggering, so it's too late.

## Body Writing Rules

- Use **imperative/infinitive** form: "Run the script", not "You should run the script"
- **Default assumption: Claude is already smart.** Only write what Claude genuinely doesn't know.
- Challenge every sentence: "Does this justify its token cost?"
- Prefer short examples over verbose explanations
- Keep body ≤ 80 lines; move detail to `references/` files
- Link reference files with context: *when* to read them, not just *that* they exist

## Navigation Links

When referencing sub-files, include a one-line reason:

```markdown
| When you need to... | Read |
|---|---|
| Understand the folder layout | [references/anatomy.md](references/anatomy.md) |
| Write the 6-step process | [references/workflow.md](references/workflow.md) |
```

This lets an agent decide *before* opening a file whether it's relevant to the current task.

## Project-Level Agent Context

When building or installing skills for a project, that project should have:

**`.agents/project-context.md`** (or `AGENTS.md`) containing:
- 4-principle philosophy adapted to the domain (e.g. Performance / Reliability / Convenience / Security)
- Explicit quality gate requirements (e.g. "run `bun lint && bun fmt:check` before marking work done")

**`CLAUDE.md`** for any project with a UI: colors, typography, component patterns, do/don't.

These files are read at session start and govern all decisions — they are not skills.
