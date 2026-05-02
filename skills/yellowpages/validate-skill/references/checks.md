# Validate — Checks Reference

## Required (❌ fail if any missing)

| Check | Threshold | How to verify |
|---|---|---|
| SKILL.md exists | Present | File at `<path>/SKILL.md` |
| Frontmatter present | Both `name:` and `description:` | Check first 5 lines for `---` block |
| SKILL.md line count | ≤ 80 | `wc -l <path>/SKILL.md` |
| Routes or explains — not both | Cover page only routes | No inline reference-level content in SKILL.md |
| All reference links annotated | "when to read" column present | References table has 3 columns |

## Required when references/ exists (❌ fail if any missing)

| Check | Threshold | How to verify |
|---|---|---|
| Each reference file line count | ≤ 100 | `wc -l` each `.md` in `references/` |
| All linked paths resolve | All files exist | Check each filename in references table exists on disk |
| No auxiliary docs | Only SKILL.md, references/, scripts/, assets/ | `ls <path>/` — flag anything else |

## Recommended (⚠️ warn if missing)

| Check | Note |
|---|---|
| `name:` matches directory name | Consistency; mismatch causes confusing skill load |
| Entry in INDEX.md | Skill is undiscoverable without it |
| Reference files each do one job | Files that both route and explain violate yellowpages rule |
