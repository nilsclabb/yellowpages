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
packages/yp-stack/src/index.js      call installSkillsManager before caveman prompt (same pattern as installCaveman)
packages/yp-stack/bin/cli.js        add --uninstall skills-manager (same pattern as --uninstall caveman)
packages/yp-stack/src/content.js    add 16 new skill files via npm run bundle (auto-generated from .agents/skills/)
hooks/install.sh                    add: copy skills-manifest.js to ~/.claude/hooks/; register SessionStart hook
hooks/uninstall.sh                  add: rm -f ~/.claude/hooks/skills-manifest.js; strip hook entry from settings.json
.agents/skills/yellowpages/INDEX.md add 16 rows (current: 30 lines → 46 lines — INDEX budget requires splitting into sections or a new index file; see INDEX budget note)
skills/yellowpages/INDEX.md         add 16 rows (current: 16 lines → 32 lines)
```

### INDEX.md budget note

The `.agents/skills/yellowpages/INDEX.md` yellowpages rule is ≤30 lines. Adding 16 rows to an already 30-line file would push it to 46 lines — exceeding budget. Two options:

**Option A (recommended):** Create a separate `SKILLS-INDEX.md` for the new utility skills (alongside the existing `INDEX.md`). `INDEX.md` keeps its current structure; `SKILLS-INDEX.md` lists the 16 new utility skills. Both files ≤30 lines.

**Option B:** Redesign `INDEX.md` to use a more compact format (one-word trigger, abbreviated descriptions) to stay under 30 lines. Higher maintenance burden.

The implementer must choose Option A or B before writing the INDEX entries. Both `INDEX.md` files (`.agents/` and `skills/`) receive the same treatment.

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
[COMMANDS: /help /status /context /session /diagnose /scaffold /validate /compress /manage /remember /forget /notes /reload /tasks /auto-plan]
```

**Multi-platform path resolution:**
The hook reads `yellowpages.config.json` from `process.cwd()` at runtime to find the platform and installed skill path. If the config is absent, falls back to `~/.claude/skills/` (Claude Code default). This ensures the manifest reflects the correct skill directory regardless of platform.

**Bundling:**
`skills-manifest.js` hook file content is a string constant in `packages/yp-stack/src/skills-manager.js` (same pattern as `HOOK_ACTIVATE`/`HOOK_TRACKER` in `caveman.js`). The 16 skill files are added to the `FILES` map in `content.js` via `npm run bundle` (existing script — auto-generates `content.js` from the `.agents/skills/` directory). `skills-manifest.js` is bundled as a string in `skills-manager.js`, not via `npm run bundle`.

**Safety rules (same as caveman-activate.js):**
- Silent-fail on all filesystem errors
- Never block session start
- Read-only scan — never modifies files
- Hardcoded fallback manifest if scan fails: emits `[YP · manifest scan failed · /diagnose to check]`

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
| `yp-session` | `/session` | Model in use, estimated context pressure (based on conversation length heuristic — exact token counts not available to the agent), active hooks, caveman mode |
| `yp-reload` | `/reload` | Print current CLAUDE.md contents + manifest state to conversation context. Does NOT re-fire the SessionStart hook (impossible mid-session) — instead Claude re-reads the files via tool use and shows current state |
| `yp-notes` | `/notes` | Print current CLAUDE.md contents — make implicit agent memory explicit |
| `yp-remember` | `/remember <fact>` | Append fact to CLAUDE.md as a bullet under a `## Agent Notes` section |
| `yp-forget` | `/forget <fact>` | Remove matching bullet from CLAUDE.md Agent Notes section |

### Medium-complexity skills (SKILL.md + references/)

**`scaffold-skill`** (`/scaffold skill <name>`)
Runs the existing `.agents/workflows/create-skill/` 4-step sequence. Creates directory structure, SKILL.md from template, `references/` folder, adds INDEX.md entry. Follows all yellowpages non-negotiables.

**`validate-skill`** (`/validate skill <path>`)
Runs `.agents/checklists/skill-quality.md` against the target skill. Reports pass/fail per criterion with line numbers. Does not fix — use `/diagnose` for auto-remediation.

**`yp-remember`** (`/remember <fact>`)
Appends fact as a bullet under `## Agent Notes` section of `CLAUDE.md`. Edge cases:
- `CLAUDE.md` absent → create it with the `## Agent Notes` section and the bullet
- `## Agent Notes` section absent → append it to end of existing `CLAUDE.md`
- Duplicate fact (exact match) → no-op, inform developer

**`yp-forget`** (`/forget <fact>`)
Removes matching bullet from `## Agent Notes`. Edge cases:
- `CLAUDE.md` or `## Agent Notes` absent → no-op, inform developer
- No exact match → fuzzy search; if ambiguous (multiple partial matches), show candidates and ask which to remove
- Exact match → remove bullet; if section becomes empty, remove the section header too

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

### TASKS.md format rules (parser contract)

- **Task names must be unique** within a file. Duplicate names produce undefined dependency resolution behavior.
- **`depends:` values are case-sensitive** and must match task names exactly as written after the task marker (e.g. `depends: Task 1` must match `- [ ] Task 1:`).
- **Missing dependency**: if a named dependency does not exist in the file, the task is treated as `[!]` (blocked) with `blocked-reason: dependency "X" not found`.
- **`depends:` is a single comma-separated line** — no multi-line syntax.
- **`blocked-reason:` is optional** when state is `[!]` but strongly recommended. Absent = unspecified block.
- **Indentation** of metadata lines (`depends:`, `worktree:`, `blocked-reason:`) uses exactly 2 spaces. Agents must write consistent indentation.
- **Task name** is everything after the state marker and space, up to the end of the line. Optional trailing colon is stripped: `- [ ] Task 1: description` → name is `Task 1`.

### Agent pickup protocol

1. Read `TASKS.md`
2. Find `[ ]` tasks whose dependencies are all `[X]` (or sequential fallback)
3. Claim: update to `[/]` with `worktree: <name> · agent started: <timestamp>`
4. Optionally: `git worktree add <path> -b <worktree-branch>`
5. Execute task
6. **MERGE BACK** (mandatory — see below)
7. Mark `[X]`, remove worktree entry from task

### Worktree merge-back — non-negotiable

**Enforcement is instructional, not mechanical.** No filesystem or git-level gate prevents marking `[X]` without merging. The three-location declaration below maximises the chance a well-behaved agent follows the rule. A misbehaving or distracted agent can still mark `[X]` without merging — this is an accepted limitation of text-based coordination.

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

## `packages/yp-stack/src/skills-manager.js` Specification

### `installSkillsManager(platform, cwd)`

**Called from `index.js`** after `installFiles` completes (same call-site pattern as `installCaveman`). Not from `install.js`.

Responsibilities (all idempotent — safe to call multiple times):

1. **Write hook file** — writes `skills-manifest.js` content (bundled string constant) to `~/.claude/hooks/skills-manifest.js`. Overwrites existing.
2. **Register SessionStart hook** — patches `~/.claude/settings.json` using same `hasCmd` idempotency check as caveman. Command string: `` `node ${path.join(os.homedir(), '.claude', 'hooks', 'skills-manifest.js')}` ``
3. **Write skill directories** — writes all 16 skill directory trees to the platform's skill path (from `installLocation` + `platformDef.skillPath`). Uses same `safeWrite` non-destructive pattern from `install.js` for existing projects.
4. **`package.json` in hooks dir** — checks if `~/.claude/hooks/package.json` exists and contains `"type": "module"`. If absent or missing the field, writes/merges it. Does not depend on caveman having run first.

### `uninstallSkillsManager(platform, cwd)`

**Called from `bin/cli.js`** when `--uninstall skills-manager` flag detected (same pattern as `uninstallCaveman`).

Responsibilities:

1. Remove `~/.claude/hooks/skills-manifest.js`
2. Strip `skills-manifest.js` SessionStart hook entry from `~/.claude/settings.json` using same `removeCmd` pattern as caveman uninstall
3. Remove the 16 skill directories from the installed skill path. **Does NOT remove `yellowpages.config.json`** — that belongs to the core install.
4. Copilot: wrap append in `<!-- yp-skills-manager:start -->`/`<!-- yp-skills-manager:end -->` markers (same pattern as caveman). Uninstall strips those markers.
5. Generic/custom: print removal instructions to stdout.

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
- A well-behaved agent following the skill instructions will not mark `[X]` without confirming worktree merge (enforcement is instructional — see worktree-protocol.md)
- `skills-manifest.js` installs automatically with every `npx yp-stack` run
- All 16 new skills pass the yellowpages quality checklist
