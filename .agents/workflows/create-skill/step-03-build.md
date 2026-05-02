# Step 3 — Build
Context: File structure planned in step-02-plan.md.

## Goal

Implement the skill: reference files first, SKILL.md last.

## Instructions

1. **Initialize the skill folder**:
   ```bash
   python skills/yellowpages/scripts/init_skill.py <skill-name> --path skills/yellowpages/
   ```

2. **Build reference files first.** For each planned reference:
   - Write the file (≤ 100 lines)
   - If it has a script, write and test the script before finishing the reference
   - Confirm it does one job only

3. **Write SKILL.md last.** Follow the mandatory cover page structure:
   - Frontmatter: `name` + `description` (comprehensive trigger)
   - 2–4 line intro
   - Reference map table with *when to read* column
   - Optional: one short Quick Start block

4. **Delete any unused placeholder files** created by the init script.

5. Count lines on every file before moving to verify.

## Output

Complete skill folder with all files written and line counts checked.

nextStep: step-04-verify.md
