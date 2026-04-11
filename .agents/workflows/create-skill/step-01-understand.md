# Step 1 — Understand
Context: Starting a new skill from zero.

## Goal

Gather enough concrete examples to know exactly what the skill needs to do before writing a single file.

## Instructions

1. Ask the user (or reason from context) for **3+ concrete example requests** that should trigger this skill.
   - "What would a user type to invoke this skill?"
   - "What should the agent produce each time?"
   - "Are there edge cases or variants?"

2. For each example, identify what makes it repetitive or non-obvious:
   - Code written the same way each time → `scripts/`
   - Reference material re-discovered each time → `references/`
   - Boilerplate document produced each time → `templates/` or `assets/`

3. Define the skill's **scope boundary**: what it handles and what it deliberately does NOT handle.

## Output

A short written list:
- Skill name + one-line description
- 3+ usage examples
- Proposed resources (scripts / references / assets)
- Scope boundary statement

nextStep: step-02-plan.md
