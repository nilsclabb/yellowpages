---
name: yp-diagnose
description: Scan all installed skills for yellowpages compliance violations and emit exact fix instructions.
---

# /yp:diagnose

Skill doctor. Scans all skills and emits violations as direct agent instructions — not just a report, but actionable steps the agent can execute immediately on "yes."

## Scope

Scans: `~/.claude/skills/`, `~/.agents/skills/`, `.agents/` in cwd (if present).

## Output format

```
YP DIAGNOSE — <date>

❌ CRITICAL (<N>)
───────────────
<path>/SKILL.md  [<actual> lines · budget: 80 · over by <N>]
  EXTRACT: lines <A>–<B> → create references/<name>.md
  KEEP:    lines <C>–<D> in SKILL.md (frontmatter + routing table)
  ADD:     "when to read" annotation to each new reference link

⚠️  WARNINGS (<N>)
─────────────────
<path>/references/<file>.md
  Lines <X>, <Y>: reference links missing "when to read" annotation
  ADD: annotation column to the links table at each line

✅ HEALTHY (<N>): <comma-separated list>

Fix CRITICAL issues now? [yes / no / details]
```

On "yes": execute the EXTRACT, KEEP, ADD, CREATE instructions in order.

## References

| File | When to read |
|---|---|
| `references/standards.md` | The full yellowpages compliance rules used as the check basis |
| `references/checks.md` | Exactly what to check and how to evaluate each criterion |
| `references/remediation.md` | How to format EXTRACT/KEEP/ADD/CREATE instructions for each violation type |
