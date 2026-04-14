---
name: scaffold-skill
description: Create a new yellowpages-compliant skill from a name and description.
---

# /yp:scaffold <name>

Create a new yellowpages-compliant skill. Follows the 4-step create-skill workflow.

**Usage:** `/yp:scaffold <name>` — e.g. `/yp:scaffold my-api-patterns`

## What Claude does

1. Ask for a one-line description if not provided
2. Create `.agents/skills/yellowpages/<name>/` directory
3. Create `SKILL.md` using the template in `references/template.md`
4. Create `references/` subdirectory
5. Add an entry to `.agents/skills/yellowpages/SKILLS-INDEX.md` under the appropriate section
6. Create publishable mirror at `skills/yellowpages/<name>/` (identical files)
7. Run `/yp:validate .agents/skills/yellowpages/<name>` to confirm compliance

Report: "Skill '<name>' scaffolded. Run `/yp:validate .agents/skills/yellowpages/<name>` to verify."

## References

| File | When to read |
|---|---|
| `references/template.md` | Writing the SKILL.md content — blank template with inline guidance |
| `references/checklist.md` | Verifying the skill meets all yellowpages non-negotiables before finishing |
