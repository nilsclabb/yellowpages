# Ping.gg Patterns Adoption — Design Spec

**Date:** 2026-04-13
**Status:** Approved for planning

---

## Context

The ping.gg team's open-source repos (`lawn`, `t3code`) contain a set of general agentic development patterns and project-infrastructure conventions that are not project-specific and directly apply to yellowpages. This spec covers adopting those patterns across two streams: the yellowpages skill system itself (reference files), and the project's own infrastructure (`packages/yp-stack/`, `.agents/`, root config).

---

## What Already Exists (No Changes Needed)

These ping.gg patterns are already well-served in yellowpages:

- **Agent philosophy doc** — `.agents/ETHOS.md` + `project-context.md` satisfy this
- **Plans committed to repo** — `docs/superpowers/plans/` already exists
- **Quality checklists** — `.agents/checklists/skill-quality.md` + `workflow-gates.md` exist

---

## Stream 1: Skills System — 6 Changes

### 1.1 Update `skills/yellowpages/references/documentation.md`

**Problem:** Currently only documents ephemeral plans stored at `<appDataDir>/brain/<conversation-id>/`. Agents working in this repo have no guidance on when or how to commit a plan to the repo for cross-session visibility.

**Change:** Add a second plan tier — "Committed Plans" — alongside the existing ephemeral tier.

**Committed plan format:**
- Location: `docs/superpowers/plans/YYYY-MM-DD-NN-name.md`
- `NN` = two-digit sequential number (`01`, `02`, …) scoped per date
- When to commit: any plan complex enough to span multiple sessions, reference in future PRs, or serve as implementation context for subagents

**Committed plan structure** (based on ping.gg's proven format):
```
# [Feature Name] Implementation Plan
Goal: [one sentence]
Architecture: [2–3 sentences]
Tech Stack: [key technologies]

## File Map
| File | Responsibility |

## Phase N: [Name]
[steps with acceptance criteria]

## Risks + Mitigations
## Success Metrics
## File Touch List
```

The existing ephemeral format (`implementation_plan.md`, `task.md`, `walkthrough.md` in brain/) is unchanged — it remains the default for exploratory or session-scoped work.

---

### 1.2 Update `skills/yellowpages/references/navigation.md`

**Problem:** The "Documentation Navigation" section lists only `brain/<conversation-id>/` as the location for planning docs. Agents that check for prior planning context won't find committed plans.

**Change:** Add `docs/superpowers/plans/` as a parallel documentation path:

```
Committed plans (repo-persistent):
  docs/superpowers/plans/YYYY-MM-DD-NN-name.md

Ephemeral plans (session-scoped):
  <appDataDir>/brain/<conversation-id>/implementation_plan.md
```

Agents should check `docs/superpowers/plans/` when they need to understand past architectural decisions or pick up work from a prior session.

---

### 1.3 Update `skills/yellowpages/references/creation-process.md`

**Problem:** Step 5 (Package) and Step 6 (Iterate) contain no quality gate check. Agents can complete a skill without confirming the surrounding code is clean.

**Change:** Add to Step 5, before packaging:
> "If the package containing this skill has `lint` and `fmt:check` scripts, run both and confirm clean output. Fix any issues before proceeding."

This mirrors t3code's mandatory `bun fmt && bun lint && bun typecheck` completion requirement — adapted for yellowpages's JS toolchain.

---

### 1.4 Update `skills/yellowpages/references/authoring.md`

**Problem:** The authoring guide covers skill-level conventions but gives no guidance on project-level agent context — leaving agents to discover or ignore AGENTS.md / `project-context.md` conventions on their own.

**Change:** Add a short section — "Project-Level Agent Context":

- Any project using yellowpages should have `.agents/project-context.md` (or `AGENTS.md`) with:
  - Explicit philosophy principles (4-principle format: Performance / Reliability / Convenience / Security, adapted to domain)
  - Quality gate requirements stated explicitly (e.g., "bun lint && bun fmt:check must pass before any task is complete")
- For any project with a UI component, a `CLAUDE.md` with design language (colors, typography, component patterns, do/don't) belongs alongside the agent context file

This makes the ping.gg agent philosophy pattern a standard part of project setup guidance in the authoring reference.

---

### 1.5 New `skills/yellowpages/references/encyclopedia.md`

**Problem:** Yellowpages introduces a significant amount of domain-specific terminology. Agents new to the system — or returning to it — currently have no single glossary to orient themselves without reading all reference files.

**Change:** Create `references/encyclopedia.md` as a living glossary of yellowpages terminology.

**Terms to define:**

| Term | Definition |
|---|---|
| Cover Page | A `SKILL.md` file that routes — tells the agent where to go, never explains in full. ≤ 80 lines. |
| Routing File | A file whose sole job is to direct the agent to the correct sub-file for their task. Never explains. |
| Explain File | A reference file with one focused job — explains exactly one topic. Never routes. |
| Progressive Disclosure | The 3-level loading model: metadata → SKILL.md body → reference files (on demand only). |
| Reference File | A detail file inside `references/`. Loaded on demand, not upfront. ≤ 100 lines. |
| Asset | An output file (template, image, font, HTML) inside `assets/`. Copied or modified, not read into context. |
| Script | Executable code inside `scripts/`. Runs to perform a task; may be invoked without loading into context. |
| INDEX.md | A ≤ 30-line master listing of all skills in a directory. One row per skill with trigger phrase and scope. |
| App Data Dir | The agent's persistent storage directory for session artifacts. Platform-specific. |
| Brain Directory | `<appDataDir>/brain/` — stores per-conversation documents (plans, tasks, walkthroughs). |
| Committed Plan | A plan doc saved to `docs/superpowers/plans/` — repo-persistent, visible across sessions. |
| Ephemeral Plan | A plan doc saved to `brain/<conversation-id>/` — session-scoped, not committed to the repo. |
| Gate | A required checkpoint in a workflow. Stored in `.agents/state/<workflow>/gates.json`. Must pass before proceeding. |
| Persona File | A `.agents/agents/*.md` file that defines a named agent role with principles and default workflow. Session-scoped. |
| Session Learnings | Observations appended to `.agents/state/learnings.jsonl` after meaningful work. Cross-session persistent. |
| Skill | A `SKILL.md` cover page + optional references/scripts/assets. Reusable procedural knowledge, not role-specific. |

---

### 1.6 Update `skills/yellowpages/SKILL.md`

**Problem:** The encyclopedia reference file has no entry in the SKILL.md reference map.

**Change:** Add one row to the "Reference Map — Navigation, Workflows & State" table:

```
| Look up a yellowpages term or concept | [references/encyclopedia.md](references/encyclopedia.md) |
```

The current SKILL.md is under the 80-line limit; this addition fits without violating the cover-page brevity rule.

---

## Stream 2: Project Infrastructure — 5 Changes

### 2.1 Add quality scripts to `packages/yp-stack/package.json`

**Problem:** `packages/yp-stack/` has no lint or format scripts. Agents completing work there have no standard quality command to run, and the `.agents/project-context.md` quality gate requirement (see 2.5) would be unenforceable.

**Change:** Add three scripts:
```json
"lint":      "oxlint src",
"fmt":       "oxfmt .",
"fmt:check": "oxfmt . --check"
```

---

### 2.2 Install oxlint + oxfmt in `packages/yp-stack/`

**Problem:** oxlint and oxfmt are referenced in the new scripts but not installed.

**Change:**
```bash
bun add -d oxlint oxfmt
```

No config files needed. oxfmt is zero-config. oxlint defaults are appropriate for Node.js ESM. No existing lint or format tooling is being replaced.

---

### 2.3 Add `.gitattributes` at project root

**Problem:** No line-ending normalisation exists. Cross-platform contributors may introduce CRLF in JS and Markdown files.

**Change:** Create `.gitattributes`:
```
* text=auto eol=lf
*.js   text eol=lf
*.md   text eol=lf
*.json text eol=lf
*.yaml text eol=lf
```

---

### 2.4 Add `CONTRIBUTING.md` at project root

**Problem:** Yellowpages is a publishable open-source skill system with no contribution guidelines. External contributors have no signal about what kinds of PRs are welcome.

**Change:** Create `CONTRIBUTING.md` modelled on t3code's honest, direct approach:

- Not actively accepting large contributions right now
- Small, focused bug fixes are most likely to be accepted
- Large PRs, sweeping rewrites, and unasked-for features are most likely to be closed
- Open an issue first for anything non-trivial
- Include before/after context for any change affecting behaviour

The goal is to set honest expectations and protect project direction — not to discourage good contributions.

---

### 2.5 Update `.agents/project-context.md` — quality gate requirement

**Problem:** The "Global Constraints" section lists file/folder rules but has no quality gate completion requirement for the `packages/yp-stack/` codebase. Agents completing JS work have no authoritative statement that lint + fmt must pass.

**Change:** Add to the "Global Constraints" section:
> "Before any task touching `packages/yp-stack/` is marked complete, run `bun lint && bun fmt:check` inside that package and confirm clean output."

---

## Summary of All Changes

| # | File | Type | What Changes |
|---|---|---|---|
| 1.1 | `skills/yellowpages/references/documentation.md` | Update | Add committed plan tier + ping.gg plan structure |
| 1.2 | `skills/yellowpages/references/navigation.md` | Update | Add `docs/superpowers/plans/` to documentation navigation |
| 1.3 | `skills/yellowpages/references/creation-process.md` | Update | Add quality gate check at Step 5 |
| 1.4 | `skills/yellowpages/references/authoring.md` | Update | Add project-level agent context guidance |
| 1.5 | `skills/yellowpages/references/encyclopedia.md` | New | Living glossary of all yellowpages terms |
| 1.6 | `skills/yellowpages/SKILL.md` | Update | Add encyclopedia.md row to reference map |
| 2.1 | `packages/yp-stack/package.json` | Update | Add lint, fmt, fmt:check scripts |
| 2.2 | `packages/yp-stack/` devDeps | Install | Add oxlint + oxfmt |
| 2.3 | `.gitattributes` | New | Line-ending normalisation |
| 2.4 | `CONTRIBUTING.md` | New | Honest contribution guidelines |
| 2.5 | `.agents/project-context.md` | Update | Add quality gate completion requirement |

---

## Out of Scope

- Convex-specific patterns (prewarm, rate limiting, security utils) — not applicable, no Convex in this project
- Route construction helpers — no routing in this codebase
- OG / image generation — project-specific to lawn
- UI design language (CLAUDE.md) — no UI in this project
- Vitest / test setup — separate concern, not part of this adoption
