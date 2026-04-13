# Step 4 — Verify
Context: Skill folder built in step-03-build.md.

## Goal

Confirm the skill meets yellowpages standards before marking it complete.

## Instructions

1. Run the quality checklist at `.agents/checklists/skill-quality.md` — work through every item.

2. Fix any failing items before continuing.

3. Add the skill to the INDEX:
   - Open `.agents/skills/yellowpages/INDEX.md`
   - Add one row: `| skill-name | trigger phrase | scope (3–5 words) |`

4. Package the skill (optional, for distribution):
   ```bash
   python skills/yellowpages/scripts/package_skill.py .agents/skills/<skill-name>
   ```

5. Write or update `walkthrough.md` in the conversation artifact directory summarizing what was built and any design decisions.

## Output

- Passing checklist
- Updated `INDEX.md`
- (Optional) packaged `.skill` file
- Updated `walkthrough.md`
