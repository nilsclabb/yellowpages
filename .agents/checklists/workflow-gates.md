# Checklist: Workflow Gates

Verifies that required review gates have passed before marking a workflow complete or creating a deliverable. Run this at the end of any multi-step workflow.

## How to Check Gates

Read `.agents/state/<workflow-name>/gates.json`. Each gate listed as `required: true` must have status `passed` before proceeding.

## Required Gates (All Workflows)

- [ ] All workflow steps have been completed in order (no skipped steps)
- [ ] `latest-output.md` exists at `.agents/state/<workflow-name>/`
- [ ] `gates.json` has been written with all gate statuses

## Required Gates (Skill Creation Workflows)

- [ ] `skill-quality.md` checklist has been run and all criteria pass
- [ ] New skill appears in the right group in `skills/yellowpages/INDEX.md`
- [ ] All files in the skill folder are within line limits (SKILL.md ≤ 80, references ≤ 100)

## Required Gates (Any Workflow Producing a User-Facing Artifact)

- [ ] User has reviewed and approved the artifact before it is marked final
- [ ] Artifact state is set to `status: complete` in YAML frontmatter (if applicable)
- [ ] Session learnings have been appended to `.agents/state/learnings.jsonl`

## On Incomplete Gates

If any required gate has not passed:

1. Stop — do not mark the workflow complete
2. State clearly which gates are missing
3. Ask the user if they want to address them now or defer with an explicit decision logged

## On Gate Deferral

If a gate is deferred by explicit user decision, log it:

```json
{"date":"...","gate":"skill-quality","status":"deferred","reason":"User confirmed acceptable for prototype only"}
```

Append this to `learnings.jsonl` so future sessions know the deferral was intentional.
