# Scaffold — SKILL.md Template

Copy this template when creating a new skill. Replace <placeholders>.

---

```markdown
---
name: <skill-name>          # lowercase, hyphenated, matches directory name
description: <one sentence — what this skill does and when to use it>
---

# /<trigger-command>

<2–3 sentence description of what this skill does. Written for the developer, not the agent.>

## <Main Section>

<Content goes here. This is the cover page — it routes to references, does not explain everything.
Keep total file to ≤80 lines.>

## References

| File | When to read |
|---|---|
| `references/<file>.md` | <specific reason to read this file — not just "for more info"> |
```
---

## Cover page rules

- ≤ 80 lines total (including frontmatter and blank lines)
- Frontmatter: `name:` and `description:` only
- Body routes to reference files — does not duplicate their content
- Every reference link has a "when to read" annotation
- One job: describe what the skill does, how to trigger it, where to find detail
