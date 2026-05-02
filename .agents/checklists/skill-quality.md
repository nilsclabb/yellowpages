# Checklist: Skill Quality

Verifies a skill meets yellowpages standards before marking it complete.

## Cover Page (SKILL.md)

- [ ] `SKILL.md` is ≤ 80 lines
- [ ] Frontmatter contains only `name` and `description` (no other keys)
- [ ] `description` states both *what the skill does* AND *when to trigger it*
- [ ] Body starts with a 2–4 line intro paragraph (no section heading required)
- [ ] Reference map table is present with a *when to read* reason for every link
- [ ] No content is duplicated between SKILL.md and any reference file

## Reference Files

- [ ] Every reference file is ≤ 100 lines
- [ ] Every reference file does exactly one job (routes OR explains)
- [ ] If any reference file exceeds 80 lines, it opens with a table of contents
- [ ] All links in SKILL.md resolve to actual files that exist

## INDEX.md

- [ ] The skill appears in the correct group in `skills/yellowpages/INDEX.md`
- [ ] Router skills appear in Runtime Routers; leaf skills appear in Leaf Skill Groups

## General

- [ ] No auxiliary files inside the skill folder (no README.md, CHANGELOG.md, etc.)
- [ ] No bare cross-references — every link states *when* to read it
- [ ] Skill folder contains only: `SKILL.md`, `references/`, `scripts/`, `assets/`

## On Failure

Fix any failing item before marking the skill complete. Do not package a skill until all criteria pass.
