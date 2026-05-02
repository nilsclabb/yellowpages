---
name: scaffold-skill
description: Create a new yellowpages-compliant skill from a name and description.
---

# Scaffold Skill

Create a new yellowpages-compliant skill. Follows the 4-step create-skill workflow.

Invoke this skill by name with the desired skill slug, for example: "Use `scaffold-skill` to create `my-api-patterns`."

## What Claude does

1. Ask for a one-line description if not provided
2. Create `skills/yellowpages/<name>/` directory
3. Create `SKILL.md` using the template in `references/template.md`
4. Create `references/` subdirectory
5. Add an entry to `skills/yellowpages/INDEX.md`
6. Run `validate-skill` on `skills/yellowpages/<name>` to confirm compliance

Report: "Skill '<name>' scaffolded. Use `validate-skill` on `skills/yellowpages/<name>` to verify."

## References

| File | When to read |
|---|---|
| `references/template.md` | Writing the SKILL.md content — blank template with inline guidance |
| `references/checklist.md` | Verifying the skill meets all yellowpages non-negotiables before finishing |
