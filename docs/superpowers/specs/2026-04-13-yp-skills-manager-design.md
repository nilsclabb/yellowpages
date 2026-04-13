# YP Skills Manager — Design Spec (Sub-project 1)

**Date:** 2026-04-13
**Status:** Approved

---

## Problem

No visibility into what the agent picks up globally vs. per-project. No easy way to manage the full yellowpages skill ecosystem from within a session. No standard for multi-agent task coordination. Skills from other libraries (superpowers, custom) have no path to yellowpages compliance.

## Goal

Make the yellowpages stack self-managing: developers can inspect, install, remove, update, scaffold, validate, and orchestrate work — all from within a Claude Code conversation. The skills manager is a core feature of every `npx yp-stack` install, not an opt-in.

## Non-Goals

- Migrating from superpowers (future sub-project)
- Git workflow commands: `/pr`, `/review`, `/branch`, `/diff` (Sub-project 2)
- Project setup commands: `/init project`, `/add skill`, `/remove skill` (Sub-project 2)
- Agent workflow commands: `/brainstorm`, `/plan`, `/estimate` (Sub-project 2)
- Maintenance commands: `/update`, `/sync` (Sub-project 2)

---

## Architecture

### New files in the yellowpages repo

```
hooks/
  skills-manifest.js          SessionStart hook — scans + injects manifest

.agents/skills/yellowpages/
  manage-global-skills/       /manage global skills
    SKILL.md
    references/
      scanning.md             what gets scanned and where
      actions.md              install/remove/update commands
      sources.md              where skills come from
  manage-project-skills/      /manage project skills
    SKILL.md
    references/
      scanning.md
      actions.md
  yp-diagnose/                /diagnose — skill doctor + auto-remediation
    SKILL.md
    references/
      standards.md            yellowpages compliance rules
      checks.md               what gets checked and how
      remediation.md          auto-repair instruction format
  scaffold-skill/             /scaffold skill <name>
    SKILL.md
    references/
      template.md
      checklist.md
  validate-skill/             /validate skill <path>
    SKILL.md
    references/
      checks.md
  yp-compress/                /compress <file>
    SKILL.md
    references/
      rules.md
  yp-help/                    /help
    SKILL.md
  yp-status/                  /status
    SKILL.md
  yp-context/                 /context
    SKILL.md
  yp-session/                 /session
    SKILL.md
  yp-reload/                  /reload
    SKILL.md
  yp-notes/                   /notes
    SKILL.md
  yp-remember/                /remember <fact>
    SKILL.md
  yp-forget/                  /forget <fact>
    SKILL.md
  yp-tasks/                   /tasks — task state viewer + claim/complete
    SKILL.md
    references/
      format.md               TASKS.md format specification
      pickup-protocol.md      how agents claim and complete tasks
      worktree-protocol.md    mandatory merge-back procedure
  auto-plan/                  /auto-plan — generate TASKS.md from description
    SKILL.md
    references/
      generation-rules.md     how to decompose work into tasks

skills/yellowpages/           publishable mirrors of all above (identical)
  manage-global-skills/
  manage-project-skills/
  yp-diagnose/
  scaffold-skill/
  validate-skill/
  yp-compress/
  yp-help/
  yp-status/
  yp-context/
  yp-session/
  yp-reload/
  yp-notes/
  yp-remember/
  yp-forget/
  yp-tasks/
  auto-plan/

packages/yp-stack/src/
  skills-manager.js           installSkillsManager / uninstallSkillsManager
```

### Modified files

```
packages/yp-stack/src/install.js    add skills manager to core install flow
packages/yp-stack/src/index.js      install skills manager before caveman prompt
packages/yp-stack/bin/cli.js        add --uninstall skills-manager
packages/yp-stack/src/content.js    bundle new skill files (via npm run bundle)
hooks/install.sh                    also copy skills-manifest.js
hooks/uninstall.sh                  also remove skills-manifest.js
.agents/skills/yellowpages/INDEX.md add 16 new skill entries
skills/yellowpages/INDEX.md         add 16 new skill entries
```

---

## Section 1 — Manifest Hook

### `hooks/skills-manifest.js` (SessionStart)

Runs alongside `caveman-activate.js` on every session start. Scans three layers, emits compact manifest as invisible system context.

**Layer 1 — Global yellowpages install** (`~/.claude/skills/yellowpages/`)
All sub-skills installed by `npx yp-stack`. Checks presence of each skill directory.

**Layer 2 — Full global skill picture** (`~/.claude/skills/`)
All skills installed globally. Separates yellowpages vs. superpowers vs. other. Detects overlaps by comparing skill names.

**Layer 3 — Current project context** (scanned from `process.cwd()`)
Checks for: `.agents/` folder, `CLAUDE.md`, `AGENTS.md`, `yellowpages.config.json`, `TASKS.md`.

**Emitted to stdout (4 lines max):**

```
[YP v0.1.0 · global: caveman✓ convex-patterns✓ frontend-arch✓ preferred-stack✓ ui-components✓ monorepo✓]
[GLOBAL: yellowpages(6) superpowers(15) other(0) · overlap: brainstorming]
[PROJECT: .agents/✓ CLAUDE.md✓ yp-config✓ platform:claude · TASKS.md: 3 tasks, 1 in-progress]
[COMMANDS: /help /status /context /session /diagnose /scaffold /validate /compress /manage /remember /forget /notes /reload /commit /handoff /tasks /auto-plan]
```

**Safety rules (same as caveman-activate.js):**
- Silent-fail on all filesystem errors
- Never block session start
- Read-only scan — never modifies files
- Hardcoded fallback manifest if scan fails

---

## Section 2 — Management Skills

### `/manage global skills`

Triggered when developer types `/manage global skills`. Agent loads `manage-global-skills/SKILL.md`, scans state from manifest (already in context), and presents:

```
GLOBAL SKILL LIBRARIES

yellowpages (v0.1.0 · 16 skills · platform: claude)
  ✓ caveman · ✓ convex-patterns · ✓ frontend-arch · ✓ preferred-stack
  ✓ ui-component · ✓ monorepo · ✓ manage-global · ✓ manage-project
  ✓ yp-diagnose · ✓ scaffold-skill · ✓ validate-skill · ✓ yp-compress
  ✓ yp-help · ✓ yp-status · ✓ yp-context · ✓ yp-tasks

superpowers (v5.0.7 · 15 skills · plugin)
  brainstorming, tdd, subagent-driven-development ... [+12]
  ⚠ overlap with yellowpages: brainstorming

other (0 skills)

Actions:
[1] Install a skill      [4] View skill details
[2] Remove a skill       [5] Check for updates
[3] Update yellowpages   [6] Done
```

### `/manage project skills`

Scans current working directory and presents project-level picture:

```
PROJECT SKILL CONTEXT  (/path/to/project)

yellowpages.config.json  ✓  platform: claude · scope: project · v0.1.0

.agents/
  skills/yellowpages/caveman/         ✓ active
  skills/yellowpages/convex-patterns/ ✓ active
  project-context.md                  ✓ loaded on session start
  ETHOS.md                            ✓ loaded on session start
  workflows/create-skill/             ✓ available
  checklists/                         ✓ skill-quality, workflow-gates

CLAUDE.md    ✓ present
AGENTS.md    ✗ not present
TASKS.md     ✓ present — 3 tasks (1 in-progress, 2 pending)

Actions:
[1] Add skill to project     [4] View agent startup context
[2] Remove skill             [5] Open TASKS.md
[3] Edit project-context.md  [6] Done
```

---

## Section 3 — Utility Skills

### Low-complexity skills (SKILL.md only, no sub-references needed)

| Skill | Trigger | What it does |
|---|---|---|
| `yp-help` | `/help` | One-shot reference card: all yp-stack commands, caveman modes, installed skills |
| `yp-status` | `/status` | Session snapshot: caveman mode, active skills, project context, hook health |
| `yp-context` | `/context` | Full transparency: everything injected into this session (CLAUDE.md summary, .agents/ state, manifest, hooks) |
| `yp-session` | `/session` | Model in use, tokens consumed, context window remaining |
| `yp-reload` | `/reload` | Re-read CLAUDE.md, re-inject manifest, refresh skill list — without restarting session |
| `yp-notes` | `/notes` | Print current CLAUDE.md contents — make implicit agent memory explicit |
| `yp-remember` | `/remember <fact>` | Append fact to CLAUDE.md as a bullet under a `## Agent Notes` section |
| `yp-forget` | `/forget <fact>` | Remove matching bullet from CLAUDE.md Agent Notes section |

### Medium-complexity skills (SKILL.md + references/)

**`scaffold-skill`** (`/scaffold skill <name>`)
Runs the existing `.agents/workflows/create-skill/` 4-step sequence. Creates directory structure, SKILL.md from template, `references/` folder, adds INDEX.md entry. Follows all yellowpages non-negotiables.

**`validate-skill`** (`/validate skill <path>`)
Runs `.agents/checklists/skill-quality.md` against the target skill. Reports pass/fail per criterion with line numbers. Does not fix — use `/diagnose` for auto-remediation.

**`yp-compress`** (`/compress <file>`)
Rewrites target file (typically CLAUDE.md, project-context.md) into caveman-style terse prose. Cuts input tokens ~46%. Saves original as `<filename>.original.md`. Technical terms, code blocks, URLs, headings, dates pass through untouched. Retries up to 2x on failure with targeted patches.

---

## Section 4 — `/diagnose` (Skill Doctor)

The most innovative command. Output is structured as both a human-readable report AND direct agent instructions — the agent reads it and can act immediately.

### What gets checked

For every skill in `~/.claude/skills/`, `~/.agents/skills/`, and `.agents/` in CWD:

| Check | Standard |
|---|---|
| SKILL.md line count | ≤ 80 lines |
| Each reference file line count | ≤ 100 lines |
| All reference links have "when to read" | Required |
| INDEX.md entry exists | Required |
| Frontmatter present (name + description) | Required |
| No auxiliary docs inside skill folder | Required |
| Files either route OR explain, not both | Required |

### Output format

```
YP DIAGNOSE — 2026-04-13

❌ CRITICAL (1)
───────────────
~/.claude/skills/old-api-skill/SKILL.md  [156 lines · budget: 80 · over by 76]
  EXTRACT: lines 36–95 → create references/api-reference.md
  EXTRACT: lines 96–156 → create references/examples.md
  KEEP:    lines 1–35 in SKILL.md (frontmatter + routing table)
  ADD:     "when to read" annotation to each new reference link
  ADD:     INDEX.md entry if missing

⚠️  WARNINGS (2)
─────────────────
~/.claude/skills/my-skill/references/guide.md
  Lines 12, 24, 31: reference links missing "when to read" annotation
  ADD: annotation column to links table at each line

~/.claude/skills/another-skill/SKILL.md
  No INDEX.md found
  CREATE: INDEX.md → | `another-skill` | [trigger] | [SKILL.md](SKILL.md) |

✅ HEALTHY (14): caveman, yellowpages, convex-patterns, manage-global-skills ...

Fix CRITICAL issues now? [yes / no / details]
```

`EXTRACT`, `KEEP`, `ADD`, `CREATE` lines are exact agent instructions. On "yes", agent executes them in order.

---

## Section 5 — Task Orchestration

### `TASKS.md` format

```markdown
# Plan: <description>

_Started: YYYY-MM-DD · Branch: <branch-name>_

## Tasks

- [X] Task 1: <description>
  <notes>

- [/] Task 2: <description>        ← in progress
  depends: Task 1
  worktree: <branch-name> · agent started: <ISO timestamp>
  ⚠️  MERGE REQUIRED before marking [X]

- [ ] Task 3: <description>
  depends: Task 1                  ← available (Task 1 is [X])

- [ ] Task 4: <description>
  depends: Task 2, Task 3          ← blocked (Task 2 not [X] yet)

- [!] Task 5: <description>        ← blocked, needs human
  depends: Task 3
  blocked-reason: <description>
```

### State machine

| Marker | Meaning | Transition rule |
|---|---|---|
| `[ ]` | Not started | → `[/]` when agent claims it |
| `[/]` | In progress | → `[X]` only after worktree merged |
| `[X]` | Complete | Terminal |
| `[!]` | Blocked | → `[ ]` when human resolves |

### Dependency resolution

**Explicit** (preferred): task lists `depends: Task A, Task B` — available only when all named tasks are `[X]`.

**Sequential fallback**: no `depends:` declared — available when all tasks above it in the file are `[X]`.

**Parallel detection**: tasks with no shared dependencies and satisfied deps can be claimed simultaneously by different agents.

### Agent pickup protocol

1. Read `TASKS.md`
2. Find `[ ]` tasks whose dependencies are all `[X]` (or sequential fallback)
3. Claim: update to `[/]` with `worktree: <name> · agent started: <timestamp>`
4. Optionally: `git worktree add <path> -b <worktree-branch>`
5. Execute task
6. **MERGE BACK** (mandatory — see below)
7. Mark `[X]`, remove worktree entry from task

### Worktree merge-back — non-negotiable

Declared in three locations in `yp-tasks/`:

**In `SKILL.md`:**
```
⚠️ WORKTREE RULE: Every worktree MUST be merged back to its origin branch
before marking a task [X]. Marking [X] without merging = incomplete work.
Completion checklist enforces this — no exceptions.
```

**In `references/worktree-protocol.md`:**
Full step-by-step: create worktree → work → resolve conflicts → merge → verify tests → remove worktree → THEN mark `[X]`.

**Written into every claimed task entry:**
```
⚠️  MERGE REQUIRED before marking [X]
```

**Completion checklist (agent must confirm before marking `[X]`):**
```
Before marking complete, confirm all:
[ ] git merge <worktree-branch> → <origin-branch> completed
[ ] Merge conflicts resolved
[ ] Tests pass on merged branch
[ ] Worktree removed: git worktree remove <path>
All confirmed? Mark [X].
```

### `/auto-plan` command

Given any description of work (requirement list, GitHub issue, problem statement), agent:

1. Identifies independent vs. sequential tasks
2. Declares explicit `depends:` relationships
3. Flags which tasks can run in parallel
4. Writes `TASKS.md` to repo root (or specified path)
5. Prints summary: `"6 tasks · 2 can start now · 3 parallelisable once Task 2 completes"`

### `/tasks` command

Shows current `TASKS.md` state. Options: claim next available task, mark current task complete, view blocked tasks, open TASKS.md for editing.

### Manifest hook update

If `TASKS.md` present in CWD, the manifest line includes:
```
[PROJECT: .agents/✓ CLAUDE.md✓ · TASKS.md: 4 tasks (1 done, 1 in-progress, 2 pending)]
```

---

## Install Flow

### `npx yp-stack` — updated sequence

Skills manager is **core** (not opt-in):

```
1. Install yellowpages skill + sub-skills       (existing)
2. Register skills-manifest.js SessionStart hook (NEW — always installed)
3. Write all 16 utility skills to skill path    (NEW — always installed)
4. "Install caveman terse mode?" [Y/n]          (existing opt-in)
```

### `packages/yp-stack/src/skills-manager.js`

Exports `installSkillsManager(platform, cwd)` and `uninstallSkillsManager(platform, cwd)`.

Responsibilities:
- Copy `skills-manifest.js` to `~/.claude/hooks/` (Claude Code) or platform equivalent
- Patch `~/.claude/settings.json` to register SessionStart hook (idempotent, same `hasCmd` pattern as caveman)
- Write all 16 skill directories to target skill path from bundled content
- Uninstall: reverse all of the above

### Standalone scripts

`hooks/install.sh` and `hooks/uninstall.sh` updated to also handle `skills-manifest.js`.

### `npx yp-stack --uninstall skills-manager`

Calls `uninstallSkillsManager(platform, cwd)`. Reads platform from `yellowpages.config.json` if present, else prompts.

---

## Skill Size Budgets

All new skills follow yellowpages non-negotiables:

| Skill type | SKILL.md | Reference files |
|---|---|---|
| Low-complexity (yp-help, yp-status, etc.) | ≤ 40 lines | None needed |
| Medium-complexity (scaffold, validate, compress) | ≤ 80 lines | ≤ 100 lines each |
| High-complexity (diagnose, manage-*, tasks, auto-plan) | ≤ 80 lines | ≤ 100 lines each |

---

## Success Criteria

- `/help`, `/status`, `/context`, `/session`, `/reload`, `/notes`, `/remember`, `/forget` all work in any project after install
- `/manage global skills` shows accurate inventory of all globally installed skill libraries
- `/manage project skills` shows accurate project context including `.agents/`, CLAUDE.md, TASKS.md state
- `/diagnose` finds real violations and emits exact remediation instructions the agent can follow immediately
- `/scaffold skill <name>` produces a valid yellowpages-compliant skill that passes `/validate`
- `/validate skill <path>` correctly identifies passing and failing skills
- `/compress <file>` reduces file size by ≥30% while preserving all technical content
- `/auto-plan` generates a valid `TASKS.md` with correct dependency declarations
- Multiple agents can work from the same `TASKS.md` without claiming the same task
- No agent can mark a task `[X]` without confirming worktree merge
- `skills-manifest.js` installs automatically with every `npx yp-stack` run
- All 16 new skills pass the yellowpages quality checklist
