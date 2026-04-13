# Scaffold — Quality Checklist

Run through before marking scaffold complete. All criteria must pass.

## SKILL.md checks

- [ ] File exists at `<path>/SKILL.md`
- [ ] Frontmatter present: starts with `---`, contains `name:` and `description:`
- [ ] `name:` value matches the skill directory name exactly
- [ ] Line count ≤ 80: `wc -l SKILL.md`
- [ ] File routes to references — no inline reference content
- [ ] All reference links have "when to read" annotation in the table

## Reference file checks (if references/ exists)

- [ ] Each file ≤ 100 lines: `wc -l references/*.md`
- [ ] Each file does one job (either routes or explains — not both)
- [ ] All linked paths resolve: every file in the references table exists on disk
- [ ] No auxiliary docs (README, CHANGELOG, etc.) inside the skill folder

## Index check

- [ ] Entry added to `SKILLS-INDEX.md` (or `INDEX.md` if applicable)

## Mirror check

- [ ] `skills/yellowpages/<name>/` exists and is identical to `.agents/` version
- [ ] `diff .agents/skills/yellowpages/<name>/ skills/yellowpages/<name>/` → no output
