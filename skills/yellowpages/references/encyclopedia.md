# Encyclopedia

Living glossary of yellowpages terms. Read when unfamiliar with a term
used in a skill or reference file.

| Term | Definition |
|---|---|
| Cover Page | A `SKILL.md` file that routes — tells the agent where to go. Never explains in full. ≤ 80 lines. |
| Routing File | A file whose only job is directing the agent to the correct sub-file. Never explains. |
| Explain File | A reference file with one focused job: explains exactly one topic. Never routes. |
| Progressive Disclosure | 3-level loading: metadata → SKILL.md body → reference files (on demand only). |
| Reference File | Detail file inside `references/`. Loaded on demand, not upfront. ≤ 100 lines. |
| Asset | Output file (template, image, font, HTML) inside `assets/`. Copied or modified — not read into context. |
| Script | Executable code inside `scripts/`. Runs to perform a task; may be invoked without loading into context. |
| INDEX.md | ≤ 30-line master listing. One row per skill: name, trigger phrase, scope. |
| App Data Dir | Agent's persistent storage directory for session artifacts. Platform-specific. |
| Brain Directory | `<appDataDir>/brain/` — stores per-conversation documents (plans, tasks, walkthroughs). |
| Committed Spec | Design doc saved to `docs/specs/YYYY-MM-DD-<topic>-design.md` by `yp-brainstorm` — repo-persistent, the source of truth for a plan. |
| Committed Plan | Implementation plan saved to `docs/plans/YYYY-MM-DD-<feature>.md` by `yp-auto-plan` — repo-persistent, visible across sessions. |
| Ephemeral Plan | Plan saved to `brain/<conversation-id>/` — session-scoped, not committed to the repo. |
| Gate | Required checkpoint in a workflow. Stored in `.agents/state/<workflow>/gates.json`. Must pass before proceeding. |
| Persona File | `.agents/agents/*.md` — defines a named agent role with principles and default workflow. Session-scoped. |
| Session Learnings | Observations appended to `.agents/state/learnings.jsonl` after meaningful work. Cross-session persistent. |
| Skill | `SKILL.md` cover page + optional references/scripts/assets. Reusable procedural knowledge, not role-specific. |
