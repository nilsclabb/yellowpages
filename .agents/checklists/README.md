# Checklists Directory

This directory contains **quality verification checklists** — lists of criteria that agents run through before marking work complete. Checklists enforce consistency without inflating skill files.

## Checklist File Standard

A checklist is a plain markdown file (≤ 60 lines) containing:

```markdown
# Checklist: <Name>

[One sentence — what this checklist verifies]

## Criteria

- [ ] [Specific, binary pass/fail criterion]
- [ ] [Another criterion]

## On Failure

[What to do if a criterion fails — e.g., "Fix before proceeding", "Flag for user review"]
```

**Rules:**
- Each criterion must be binary — it either passes or fails, no partial credit
- Phrase criteria as actionable checks: "SKILL.md is ≤ 80 lines" not "File length"
- Group related criteria under `##` subheadings if the list exceeds 10 items

## Available Checklists

| Checklist | Verifies |
|---|---|
| [skill-quality.md](skill-quality.md) | A skill meets yellowpages standards before marking complete |

## Adding a New Checklist

1. Create `<name>.md` in this directory (≤ 60 lines)
2. Add a row to the table above
3. Add a row to the relevant table in this README
