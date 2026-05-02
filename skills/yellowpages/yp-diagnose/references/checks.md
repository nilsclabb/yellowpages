# Diagnose — Checks Reference

## Severity levels

- **❌ CRITICAL** — violates a non-negotiable rule; must be fixed
- **⚠️ WARNING** — violates a recommendation; should be fixed
- **✅ HEALTHY** — all checks pass

## Check sequence (run in this order for each skill)

1. `SKILL.md` exists → CRITICAL if missing
2. Frontmatter present (name + description) → CRITICAL if missing
3. `SKILL.md` line count → CRITICAL if > 80; record exact count
4. File routes OR explains (not both) → CRITICAL if SKILL.md contains both routing table and multi-paragraph explanations
5. All reference table links annotated with "when to read" → CRITICAL if any bare links
6. Each `references/*.md` line count → CRITICAL if > 100; record which files
7. All linked files exist on disk → WARNING if any 404
8. No auxiliary docs in skill folder → WARNING if README.md, CHANGELOG.md, etc. present
9. `name:` matches directory name → WARNING if mismatch
10. `INDEX.md` category entry exists → WARNING if absent
11. No duplicate `.agents/skills/` copy exists → WARNING if duplicated

## Scan order

1. `skills/yellowpages/` — repository source of truth
2. `~/.claude/skills/` — installed Claude skills, if present
3. `~/.agents/skills/` — native agent discovery path, if present

Deduplicate by absolute path before reporting.
