# Skill Design — Yellowpages Standard

This file defines how to design a skill that complies with the yellowpages standard.

## Size Budget

| File | Limit |
|---|---|
| `SKILL.md` (cover page) | ≤ 80 lines |
| Individual reference files | ≤ 100 lines |
| `INDEX.md` | ≤ 30 lines |

If a reference file grows beyond 100 lines, open it with a table of contents (first 10 lines), then split the longest sections into separate files linked from the TOC.

## Mandatory Cover Page Structure

Every SKILL.md must follow this structure in order:

```markdown
---
name: skill-name
description: [what it does] + [when to trigger it — be comprehensive]
---

# Skill Title

[2–4 line description. What the skill is for. No more.]

## Reference Map

| When you need to... | Read |
|---|---|
| [specific task] | [references/file.md](references/file.md) |

## [Optional: Quick Start / one short code block or workflow]
```

The description or body may add one optional "Quick Start" section with a short code block or minimal example. Everything else goes in reference files.

## When to Create Sub-Skills vs. Reference Files

**Use a reference file** (`references/foo.md`) when:
- The content is detail that extends the parent skill
- It will only ever be read as part of this skill's workflow
- It is too large to fit inline in SKILL.md

**Use a sibling skill with its own `SKILL.md`** when:
- The topic is independently useful and should trigger on its own
- A different team or repo might install it separately
- It has its own scripts, assets, or reference files

**Never nest** skill folders inside other skill folders. Sibling skills live flat in `.agents/skills/`.

## Linking Syntax

Always link with a *reason* so the agent can decide before opening:

```markdown
Read [references/schema.md](references/schema.md) when working with database queries.
```

Or in a navigation table:

```markdown
| When diagnosing slow queries | [references/performance.md](references/performance.md) |
```

Never link without context: `See [file.md](file.md).` alone is not enough.
