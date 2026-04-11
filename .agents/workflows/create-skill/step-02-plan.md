# Step 2 — Plan
Context: Usage examples and resource list defined in step-01-understand.md.

## Goal

Design the complete file structure for the skill before writing any files.

## Instructions

1. Map each identified resource to a file:
   - Reusable script → `references/<task>.py` or `scripts/<task>.py`
   - Reference document → `references/<topic>.md`
   - Output template → `assets/<name>/` or `templates/<name>.md`

2. Design the `SKILL.md` navigation table — list every reference file with a one-line *when to read* reason.

3. Confirm the cover page can stay ≤ 80 lines with the planned links.

4. Check: does any reference file risk exceeding 100 lines? If yes, split it now before building.

5. Write the plan as a simple list:
   ```
   skill-name/
   ├── SKILL.md           ← [describe key sections]
   └── references/
       ├── topic-a.md     ← [when to read]
       └── topic-b.md     ← [when to read]
   ```

## Output

File structure plan with annotated *when to read* notes for each file.

nextStep: step-03-build.md
