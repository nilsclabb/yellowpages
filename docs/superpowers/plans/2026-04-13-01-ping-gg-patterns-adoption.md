# Ping.gg Patterns Adoption Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adopt general agentic development patterns and project-infrastructure conventions from ping.gg's open-source repos (lawn, t3code) into the yellowpages skill system and project.

**Architecture:** Two parallel streams — Stream 1 updates six reference files inside `skills/yellowpages/` to encode the patterns as reusable guidance; Stream 2 adds project infrastructure (quality scripts, tooling, config files) to the repo and `packages/yp-stack/`. Infrastructure (Stream 2) lands first since Stream 1 references the quality commands.

**Tech Stack:** Markdown, Node.js ESM, oxlint (^1.60.0), oxfmt (^0.45.0), bun

**Spec:** `docs/superpowers/specs/2026-04-13-ping-gg-patterns-design.md`

---

## Chunk 1: Project Infrastructure (Stream 2)

### Task 1: Add quality scripts and install oxlint + oxfmt in yp-stack

**Files:**
- Modify: `packages/yp-stack/package.json`

- [ ] **Step 1: Add lint, fmt, and fmt:check scripts to package.json**

Replace the `"scripts"` block in `packages/yp-stack/package.json` with:

```json
"scripts": {
  "bundle": "node scripts/bundle-content.js",
  "prepublishOnly": "node scripts/bundle-content.js",
  "lint": "oxlint src",
  "fmt": "oxfmt .",
  "fmt:check": "oxfmt . --check"
},
```

- [ ] **Step 2: Install oxlint and oxfmt as devDependencies**

```bash
cd packages/yp-stack && bun add -d oxlint oxfmt
```

Expected: bun resolves and installs both packages, `package.json` gains a `"devDependencies"` block.

- [ ] **Step 3: Run lint to verify it exits clean**

```bash
cd packages/yp-stack && bun lint
```

Expected: no errors (oxlint prints a summary like `Finished in Xms — 0 errors`). If errors appear, fix them before proceeding.

- [ ] **Step 4: Run fmt:check to verify formatting**

```bash
cd packages/yp-stack && bun fmt:check
```

Expected: exits 0 with no formatting issues. If oxfmt reports unformatted files, run `bun fmt` once to auto-fix, then re-run `bun fmt:check` to confirm clean.

- [ ] **Step 5: Commit**

```bash
git add packages/yp-stack/package.json packages/yp-stack/bun.lock
git commit -m "chore(yp-stack): add oxlint + oxfmt quality scripts"
```

---

### Task 2: Create .gitattributes

**Files:**
- Create: `.gitattributes`

- [ ] **Step 1: Create .gitattributes at the repo root with this exact content:**

```
* text=auto eol=lf
*.js   text eol=lf
*.md   text eol=lf
*.json text eol=lf
*.yaml text eol=lf
```

- [ ] **Step 2: Verify the file exists**

```bash
cat .gitattributes
```

Expected: prints the 5 lines above.

- [ ] **Step 3: Commit**

```bash
git add .gitattributes
git commit -m "chore: add .gitattributes for LF line-ending normalisation"
```

---

### Task 3: Create CONTRIBUTING.md

**Files:**
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: Create CONTRIBUTING.md at the repo root with this exact content:**

```
# Contributing

## Read This First

We are not actively accepting contributions right now.

You can still open an issue or PR, but please do so knowing there is a
chance we close it or defer it without immediate action.

## What We Are Most Likely to Accept

- Small, focused bug fixes
- Small reliability improvements
- Tightly scoped maintenance that clearly improves the project without
  changing its direction

## What We Are Least Likely to Accept

- Large PRs
- Drive-by feature work
- Opinionated rewrites or restructuring
- Changes that expand scope without us asking for it

If you open a large PR full of new features, we will probably close it
quickly.

## Before You Open a PR

Open an issue first for anything non-trivial. That does not guarantee we
will want the PR, but it avoids wasting your time.

Keep PRs small. Explain exactly what changed and why. Do not mix
unrelated fixes together.

If the change affects any observable behaviour, include a clear
description of what changed.

## Be Realistic

Opening a PR does not create an obligation on our side. We may close it,
ignore it, or reimplement the idea ourselves later. If you are fine with
that, proceed.
```

- [ ] **Step 2: Verify line count**

```bash
wc -l CONTRIBUTING.md
```

Expected: ~36 lines.

- [ ] **Step 3: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "docs: add CONTRIBUTING.md with honest contribution guidelines"
```

---

### Task 4: Update .agents/project-context.md — quality gate requirement

**Files:**
- Modify: `.agents/project-context.md`

The file currently ends at line 51 with:
```
- Caveman terse mode is active by default. See `.agents/skills/yellowpages/caveman/SKILL.md` to toggle or read about intensity levels.
```

- [ ] **Step 1: Add the quality gate bullet after the last line of the Global Constraints section**

Append this line at the end of the file (after the caveman line):

```
- Before any task touching `packages/yp-stack/` is marked complete, run `bun lint && bun fmt:check` inside that package and confirm clean output
```

- [ ] **Step 2: Verify the addition appears at the bottom of Global Constraints**

```bash
tail -4 .agents/project-context.md
```

Expected: the new bullet appears as the last line of the file.

- [ ] **Step 3: Commit**

```bash
git add .agents/project-context.md
git commit -m "chore: add yp-stack quality gate to project-context.md"
```

---

## Chunk 2: Skills Reference Files (Stream 1)

### Task 5: Update references/documentation.md — add committed plan tier

**Files:**
- Modify: `skills/yellowpages/references/documentation.md`

Current file: 78 lines. The section to append is ~20 lines, giving ~98 lines total — within the 100-line reference limit.

- [ ] **Step 1: Append the committed plan section to the end of the file**

Add after the final line of `documentation.md` (after line 78). The exact content to append (19 lines, bringing total to ~97):

---

```
---

## Committed Plans (Repo-Persistent)

For plans that span multiple sessions, serve as subagent context, or document architectural decisions:

**Location:** `docs/superpowers/plans/YYYY-MM-DD-NN-name.md`
`NN` = two-digit sequential number per date (`01`, `02`, …).

**Structure:**

    # [Feature] Implementation Plan
    Goal / Architecture / Tech Stack
    ## File Map — table of files + responsibilities
    ## Phase N: [Name] — steps with acceptance criteria
    ## Risks + Mitigations / Success Metrics / File Touch List

Use ephemeral plans for exploratory or short-lived work. Commit when the plan spans sessions or needs to be subagent-readable.
```

---

Note: the inner structure block uses 4-space indentation (not backtick fences) to avoid nested fence ambiguity. Sections are compressed to one line each to stay within the 100-line reference limit.

- [ ] **Step 2: Verify line count stays within limit**

```bash
wc -l skills/yellowpages/references/documentation.md
```

Expected: ~97 lines (≤ 100).

- [ ] **Step 3: Commit**

```bash
git add skills/yellowpages/references/documentation.md
git commit -m "docs(yellowpages): add committed plan tier to documentation.md"
```

---

### Task 6: Update references/navigation.md — add committed plans path

**Files:**
- Modify: `skills/yellowpages/references/navigation.md`

- [ ] **Step 1: Replace the Documentation Navigation section**

Find this exact block in `navigation.md` (lines 25–35):

```
## Documentation Navigation

Planning documents live at:
```
(fenced block)
<appDataDir>/brain/<conversation-id>/
├── implementation_plan.md
├── task.md
└── walkthrough.md
(end fenced block)

To find context from past conversations, check KI (Knowledge Items) summaries first, then conversation logs. Read `overview.txt` in a conversation log only when a KI is insufficient.
```

Replace that entire section with the following (preserving the fenced code block style used in the original file):

```
## Documentation Navigation

**Committed plans** (repo-persistent, visible to future agents):

```
docs/superpowers/plans/YYYY-MM-DD-NN-name.md
```

**Ephemeral plans** (session-scoped):

```
<appDataDir>/brain/<conversation-id>/
├── implementation_plan.md
├── task.md
└── walkthrough.md
```

When picking up work from a prior session, check `docs/superpowers/plans/`
first. To find context from past conversations, check KI summaries first,
then conversation logs.
```

Because the plan document itself uses fenced code blocks, the inner ``` above are shown as literal text — apply them as actual triple-backtick fences in the file. The section starts with `## Documentation Navigation` and ends just before `## INDEX.md Usage`.

- [ ] **Step 2: Verify line count**

```bash
wc -l skills/yellowpages/references/navigation.md
```

Expected: ~54 lines (under 100).

- [ ] **Step 3: Commit**

```bash
git add skills/yellowpages/references/navigation.md
git commit -m "docs(yellowpages): add committed plans path to navigation.md"
```

---

### Task 7: Update references/creation-process.md — add quality gate to Step 5

**Files:**
- Modify: `skills/yellowpages/references/creation-process.md`

- [ ] **Step 1: Add quality gate block inside Step 5, after the validation checks list**

Find this text in `creation-process.md` (ends at line 63):

```
Validation checks:
- YAML frontmatter format and required fields
- Naming conventions and directory structure
- Description completeness
```

Add the following block immediately after that last bullet (after line 63):

```
**Quality gate:** Before packaging, run in `packages/yp-stack/`:

    cd packages/yp-stack && bun lint && bun fmt:check

Both must exit 0. Fix any issues before running `package_skill.py`.
```

- [ ] **Step 2: Verify line count**

```bash
wc -l skills/yellowpages/references/creation-process.md
```

Expected: ~72 lines (under 100).

- [ ] **Step 3: Commit**

```bash
git add skills/yellowpages/references/creation-process.md
git commit -m "docs(yellowpages): add quality gate to creation-process Step 5"
```

---

### Task 8: Update references/authoring.md — add project-level agent context section

**Files:**
- Modify: `skills/yellowpages/references/authoring.md`

Current file: 52 lines.

- [ ] **Step 1: Append the Project-Level Agent Context section to the end of the file (after line 52)**

Exact content to append:

```
## Project-Level Agent Context

When building or installing skills for a project, that project should have:

**`.agents/project-context.md`** (or `AGENTS.md`) containing:
- 4-principle philosophy adapted to the domain (e.g. Performance / Reliability / Convenience / Security)
- Explicit quality gate requirements (e.g. "run `bun lint && bun fmt:check` before marking work done")

**`CLAUDE.md`** for any project with a UI: colors, typography, component patterns, do/don't.

These files are read at session start and govern all decisions — they are not skills.
```

- [ ] **Step 2: Verify line count**

```bash
wc -l skills/yellowpages/references/authoring.md
```

Expected: ~63 lines (under 100).

- [ ] **Step 3: Commit**

```bash
git add skills/yellowpages/references/authoring.md
git commit -m "docs(yellowpages): add project-level agent context to authoring.md"
```

---

### Task 9: Create references/encyclopedia.md

**Files:**
- Create: `skills/yellowpages/references/encyclopedia.md`

- [ ] **Step 1: Create the file with this exact content:**

```
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
| Committed Plan | Plan saved to `docs/superpowers/plans/` — repo-persistent, visible across sessions. |
| Ephemeral Plan | Plan saved to `brain/<conversation-id>/` — session-scoped, not committed to the repo. |
| Gate | Required checkpoint in a workflow. Stored in `.agents/state/<workflow>/gates.json`. Must pass before proceeding. |
| Persona File | `.agents/agents/*.md` — defines a named agent role with principles and default workflow. Session-scoped. |
| Session Learnings | Observations appended to `.agents/state/learnings.jsonl` after meaningful work. Cross-session persistent. |
| Skill | `SKILL.md` cover page + optional references/scripts/assets. Reusable procedural knowledge, not role-specific. |
```

- [ ] **Step 2: Verify line count**

```bash
wc -l skills/yellowpages/references/encyclopedia.md
```

Expected: ~23 lines (well under 100).

- [ ] **Step 3: Run the skill quality checklist for reference files**

Open `.agents/checklists/skill-quality.md` and verify all Reference Files criteria pass for `encyclopedia.md`:
- ≤ 100 lines ✅
- Does exactly one job (explains terminology) ✅
- No bare cross-references ✅

- [ ] **Step 4: Commit**

```bash
git add skills/yellowpages/references/encyclopedia.md
git commit -m "docs(yellowpages): add encyclopedia.md glossary reference"
```

---

### Task 10: Update SKILL.md — add encyclopedia.md row to reference map

**Files:**
- Modify: `skills/yellowpages/SKILL.md` (currently 63 lines — adding 1 row → 64 lines, under the 80-line limit)

- [ ] **Step 1: Add encyclopedia.md row to the navigation reference map**

Find this exact line in `SKILL.md` (line 42):

```
| Log or read cross-session learnings | [references/learnings.md](references/learnings.md) |
```

Add the following new row immediately after it:

```
| Look up a yellowpages term or concept | [references/encyclopedia.md](references/encyclopedia.md) |
```

- [ ] **Step 2: Verify line count stays within the cover-page limit**

```bash
wc -l skills/yellowpages/SKILL.md
```

Expected: 64 lines (under the 80-line cover-page limit).

- [ ] **Step 3: Run the skill quality checklist for SKILL.md**

Open `.agents/checklists/skill-quality.md` and verify all Cover Page criteria pass:
- ≤ 80 lines ✅
- Reference map has a *when to read* reason for every link ✅
- No content duplicated between SKILL.md and reference files ✅

- [ ] **Step 4: Final quality gate**

```bash
cd packages/yp-stack && bun lint && bun fmt:check
```

Both must exit 0.

- [ ] **Step 5: Commit**

```bash
git add skills/yellowpages/SKILL.md
git commit -m "docs(yellowpages): add encyclopedia.md to SKILL.md reference map"
```
