# Step 4 — Verify
Context: Skill folder built in step-03-build.md.

## Goal

Confirm the skill meets yellowpages standards before marking it complete.

## Instructions

1. Run the quality checklist at `.agents/checklists/skill-quality.md` — work through every item.

2. Fix any failing items before continuing.

3. Add the skill to the INDEX:
   - Open `skills/yellowpages/INDEX.md`
   - Add the skill to the right leaf group, or add a new category router row if it is a router.

4. Package the skill (optional, for distribution):
   ```bash
   python skills/yellowpages/scripts/package_skill.py skills/yellowpages/<skill-name>
   ```

5. Write or update `walkthrough.md` in the conversation artifact directory summarizing what was built and any design decisions.

## Output

- Passing checklist
- Updated `INDEX.md`
- (Optional) packaged `.skill` file
- Updated `walkthrough.md`
