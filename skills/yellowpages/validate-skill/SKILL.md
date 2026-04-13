---
name: validate-skill
description: Run the yellowpages quality checklist against a skill and report pass/fail per criterion.
---

# /validate skill <path>

Run quality checks on a skill. Read-only — does not fix issues. Use `/diagnose` for auto-remediation.

**Usage:** `/validate skill .agents/skills/yellowpages/my-skill`

## What Claude does

1. Read `<path>/SKILL.md` — if absent, report "SKILL.md not found at <path>" and stop
2. Run all checks from `references/checks.md` in order
3. For each failure: report the criterion, the actual value, and the line number
4. Summary line: "✅ [N] passed · ❌ [N] failed · ⚠️ [N] warnings"
5. If failures: "Run `/diagnose` to generate step-by-step fix instructions."

## References

| File | When to read |
|---|---|
| `references/checks.md` | The full list of checks, thresholds, and how to evaluate each one |
