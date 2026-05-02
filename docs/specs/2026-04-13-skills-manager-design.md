# Skills Manager & Utility Command Suite — Sub-project 1

**Date:** 2026-04-13
**Status:** Approved
**Scope:** Sub-project 1 of 3. Core infrastructure + management commands + utility commands + autonomous task orchestration.

---

## Problem

Developers using the yellowpages stack have no visibility into what their agent is loading — globally or per-project. There is no way to manage installed skills, audit skill health, or coordinate multiple agents working in parallel without manual file inspection.

## Goal

Make the yellowpages stack self-managing: agents always know what's installed, developers can manage skills and tasks from within the conversation, and multiple agents can coordinate autonomously via a shared task file.

## Non-Goals

- Git workflow commands (`/commit`, `/pr`, `/review`, `/branch`, `/diff`, `/handoff`) — Sub-project 2
- Project setup commands (`/init project`, `/add skill`, `/remove skill`) — Sub-project 2
- Maintenance commands (`/update`, `/sync`) — Sub-project 2
- Agent workflow commands (`/brainstorm`, `/plan`, `/estimate`) — Sub-project 2
- Migration from superpowers — deferred indefinitely
- Registry/versioning system for skill sources — future

---

## Architecture Overview

Three layers working together:

1. **Infrastructure hooks** — two new SessionStart hooks that inject global awareness into every session
2. **14 utility skills** — installed globally to `~/.claude/skills/`, covering management, session visibility, skill authoring, and memory
3. **Task orchestration system** — `TASKS.md` format + two skills enabling autonomous multi-agent coordination

All skills follow yellowpages conventions (SKILL.md ≤80 lines, references/ ≤100 lines, INDEX.md entry, annotated reference links).

---

## Infrastructure

### `hooks/skills-manifest.js` — SessionStart hook

Runs alongside `caveman-activate.js` on every session start. Scans three locations and emits a compact manifest as invisible system context (hook stdout):

**What it scans:**
- `~/.claude/skills/` — all globally installed skills, grouped by library
- `~/.agents/skills/` — agent runtime skills (drift detection against `~/.claude/skills/`)
- Current working directory — `.agents/` folder, `CLAUDE.md`, `AGENTS.md`, `yellowpages.config.json`, `TASKS.md`

**What it emits (3 lines, invisible to developer):**
```
[YP v0.1.0 · skills: caveman✓ convex-patterns✓ frontend-arch✓ preferred-stack✓ ui-components✓ monorepo✓]
[GLOBAL: yellowpages(6) superpowers(15) other(0) · overlap: brainstorming]
[PROJECT: .agents/✓ CLAUDE.md✓ yp-config✓ platform:claude · TASKS: 3 active / 2 pending]
[COMMANDS: /help /status /context /session /diagnose /scaffold /validate /compress /manage /remember /forget /notes /reload /tasks /auto-plan]
```

**Safety rules (same as caveman hooks):**
- Silent-fail on all filesystem errors
- Never blocks session start
- Never modifies files — read-only scan
- Emits nothing if scan fails (graceful degradation)

### `packages/yp-stack/src/skills-manager.js`

New module (mirrors `caveman.js` structure). Exports `installSkillsManager(platform, cwd)` and `uninstallSkillsManager(platform, cwd)`. Handles:
- Writing `skills-manifest.js` to `~/.claude/hooks/`
- Registering SessionStart hook in `~/.claude/settings.json` (idempotent)
- Writing all 14 utility skills to `~/.claude/skills/`
- Uninstall reverses all of the above

### `npx yp-stack` install order (updated)

```
1. Install yellowpages skill + sub-skills           (existing)
2. Register skills-manifest.js SessionStart hook    (NEW — always, no prompt)
3. Write all 14 utility skills to ~/.claude/skills/ (NEW — always, no prompt)
4. "Install caveman terse mode?" [Y/n]              (existing, now step 4)
```

Skills manager is **core** — not opt-in. Every `npx yp-stack` install includes it.

---

## Utility Skills (14 skills)

All installed globally to `~/.claude/skills/`. Each follows yellowpages skill conventions.

### Management

**`manage-global-skills/`** — `/manage global skills`
Shows full global inventory grouped by library (yellowpages, superpowers, other). Actions: install skill, remove skill, update yellowpages, view skill details, check for overlaps. Surfaces superpowers vs. yellowpages overlap to support future migration decisions.

**`manage-project-skills/`** — `/manage project skills`
Shows project-level context: `.agents/` contents, CLAUDE.md presence, `yellowpages.config.json` state, active skills in project. Actions: add skill to project, remove skill from project, edit project-context.md, view what agent loads on startup, re-run yp-stack install.

### Session & Visibility

**`yp-status/`** — `/status`
Current session snapshot: caveman mode + intensity, active skills count, project context summary, manifest injection status, hook health.

**`yp-context/`** — `/context`
Full transparency view — everything the agent loaded on startup: CLAUDE.md summary, .agents/ structure, injected hook content, active manifest. Makes the implicit explicit.

**`yp-session/`** — `/session`
Session dashboard: model in use, estimated tokens consumed, context window remaining, hooks active, skills loaded this session.

**`yp-reload/`** — `/reload`
Re-injects all hooks and skill manifest without restarting the session. Useful after editing a skill or CLAUDE.md mid-session.

**`yp-help/`** — `/help`
Quick reference card: all available yp-stack commands with one-line descriptions, caveman modes, current session state summary. One-shot display.

### Memory Management

**`yp-notes/`** — `/notes`
Displays everything currently in `CLAUDE.md` that the agent reads on session start. Makes the implicit explicit.

**`yp-remember/`** — `/remember <fact>`
Appends a structured note to `CLAUDE.md` for future sessions. Format: `<!-- yp:remember --><fact><!-- /yp:remember -->`. Idempotent — skips if identical note exists.

**`yp-forget/`** — `/forget <fact>`
Removes a note from `CLAUDE.md` by keyword search across `<!-- yp:remember -->` blocks. Confirms before deleting.

### Skill Authoring & Quality

**`scaffold-skill/`** — `/scaffold skill <name>`
Scaffolds a new yellowpages-compliant skill: creates directory structure, SKILL.md template with frontmatter, empty `references/`, and adds a placeholder INDEX.md entry. Prompts for: skill description, trigger phrases, reference file names.

**`validate-skill/`** — `/validate skill <path>`
Runs the yellowpages quality checklist against a skill at the given path:
- SKILL.md ≤80 lines
- Each reference file ≤100 lines
- All reference links have "when to read" annotations
- INDEX.md entry present
- No auxiliary docs in skill folder
- Frontmatter has name + description
Reports pass/fail per criterion with line numbers for violations.

**`yp-compress/`** — `/compress <file>`
Rewrites a memory file (CLAUDE.md, project-context.md, any `.md`) into terse caveman-style prose to cut input tokens. Preserves: headings, code blocks, URLs, file paths, commands, dates, version numbers. Rewrites: explanatory prose. Saves backup at `<filename>.original.md`. Retries up to 2× on validation failure.

### Diagnostics

**`yp-diagnose/`** — `/diagnose`
Skill doctor with auto-remediation instructions. See full design below.

---

## `/diagnose` — Skill Doctor

The most innovative command. Scans all installed skills and emits a structured report whose remediation sections are formatted as direct agent instructions — the agent can read the report and act on it immediately.

### What it scans
- `~/.claude/skills/` — all globally installed skills
- `~/.agents/skills/` — agent runtime skills
- Current project's `.agents/skills/` (if present)

### Checks per skill
1. SKILL.md line count (≤80)
2. Each reference file line count (≤100)
3. All reference links have "when to read" annotations
4. INDEX.md entry exists
5. No auxiliary docs in skill folder
6. Frontmatter present with `name` and `description` fields
7. One job per file (route vs. explain — flagged if SKILL.md contains reference-level detail)

### Output format

```
YP DIAGNOSE — 2026-04-13 · ~/.claude/skills/ + .agents/

❌ CRITICAL (1)
───────────────
~/.claude/skills/old-api-skill/SKILL.md  [156 lines · budget: 80 · over by 76]
  EXTRACT: lines 36–95 → new file references/api-reference.md
  EXTRACT: lines 96–156 → new file references/examples.md
  KEEP: lines 1–35 in SKILL.md (frontmatter + overview + routing table)
  ADD: "when to read" annotation to each new reference link
  ADD: INDEX.md entry if missing

⚠️ WARNINGS (2)
─────────────────
~/.claude/skills/my-skill/references/guide.md
  Lines 12, 24, 31: reference links missing "when to read" annotation
  ADD: annotation column to the links table at each line

~/.claude/skills/another-skill/SKILL.md
  No INDEX.md found
  CREATE: INDEX.md with | `another-skill` | [trigger] | [SKILL.md](SKILL.md) |

✅ HEALTHY (14): caveman, yellowpages, convex-patterns, manage-global-skills ...

Fix CRITICAL issues now? [yes / no / details]
```

The `EXTRACT`, `KEEP`, `ADD`, `CREATE` lines are agent instructions — Claude reads them and can execute immediately on "yes."

### Yellowpages treatment
`/diagnose` applied to non-yellowpages skills (superpowers, custom, third-party) produces the same report. The agent sees exactly what needs to change to make any skill yellowpages-compliant and can execute the conversion immediately. This is the primary path toward gradually replacing non-yellowpages skills.

---

## Task Orchestration System

### `TASKS.md` format

A coordination file that multiple agents can read from and write to. Placed at project root or any specified path.

```markdown
# Plan: <description>

_Created: YYYY-MM-DD · Branch: <branch-name> · Author: <agent or human>_

## Tasks

- [X] Task 1: <description>
  <detail>

- [/] Task 2: <description>       ← in progress
  depends: Task 1
  worktree: feat/<branch> · agent started: <ISO timestamp>
  ⚠️  MERGE BACK TO <origin-branch> REQUIRED before marking [X]

- [ ] Task 3: <description>
  depends: Task 1

- [ ] Task 4: <description>
  depends: Task 2, Task 3

- [!] Task 5: <description>       ← blocked
  depends: Task 4
  blocked: <reason>
```

### State machine

| Marker | Meaning | Transition rule |
|---|---|---|
| `[ ]` | Not started | Available when all `depends:` are `[X]`, or no deps declared and prior task is `[X]` |
| `[/]` | In progress | Set by claiming agent on pickup; includes worktree + timestamp |
| `[X]` | Complete | Set after worktree merged to origin branch and verified |
| `[!]` | Blocked | Set by agent or human when task cannot proceed |

### Dependency resolution

Two modes, used together:
1. **Explicit** — task declares `depends: Task A, Task B`. Available when all named deps are `[X]`
2. **Sequential fallback** — when no `depends:` declared, task is available when the task immediately above it is `[X]`

### Agent pickup protocol

1. Read `TASKS.md`
2. Find all `[ ]` tasks where dependencies (explicit or sequential) are all `[X]`
3. Claim: update task to `[/]` with worktree name and ISO timestamp
4. Optionally create git worktree: `git worktree add <path> -b <branch>`
5. Execute task
6. **MANDATORY: merge worktree back to origin branch** (see below)
7. Update task to `[X]`, remove worktree entry

### Worktree merge-back — non-negotiable

Written into the skill in three places:

**In `yp-tasks/SKILL.md` (cover page, visible on every invocation):**
```
⚠️ WORKTREE RULE — NON-NEGOTIABLE:
Every worktree MUST be merged back to its origin branch before marking [X].
No exceptions. The completion flow will not mark [X] without merge confirmation.
Abandoned worktrees = incomplete work = broken plan state.
```

**In `yp-tasks/references/worktree-protocol.md`:**
Full step-by-step merge procedure:
1. Complete all work in worktree branch
2. Run tests in worktree: `<test command>`
3. Switch to origin branch: `git checkout <origin>`
4. Merge: `git merge <worktree-branch>`
5. Resolve any conflicts
6. Verify tests pass on merged result
7. Remove worktree: `git worktree remove <path>`
8. Delete branch: `git branch -d <worktree-branch>`
9. ONLY THEN mark task `[X]` in `TASKS.md`

**In every in-progress task entry (written by agent on claim):**
```
⚠️  MERGE BACK TO <origin-branch> REQUIRED before marking [X]
```

**Completion gate (enforced by the skill):**
Before the agent marks `[X]`, the skill requires explicit confirmation of:
- `[ ]` Worktree merged to origin branch
- `[ ]` Conflicts resolved
- `[ ]` Tests pass on merged branch
- `[ ]` Worktree removed (`git worktree list` shows it gone)

### `yp-tasks/` skill — `/tasks`

When invoked, reads `TASKS.md` from current project root and presents:
- Current state summary (X complete / Y in progress / Z pending / W blocked)
- Available tasks (dependencies met, not claimed)
- In-progress tasks with worktree info
- Option to claim a task, mark complete, or mark blocked

### `auto-plan/` skill — `/auto-plan`

Given any description of work (list, issue, problem statement), the agent:
1. Analyses and decomposes into discrete tasks
2. Identifies dependencies between tasks
3. Flags which tasks can run in parallel
4. Writes `TASKS.md` to project root (or specified path)
5. Reports: "N tasks · M can start immediately · P parallelisable after Task X"

---

## File Inventory

### New files in yellowpages repo

```
hooks/
  skills-manifest.js                  SessionStart: scans + injects manifest

.agents/skills/yellowpages/
  manage-global-skills/SKILL.md       + references/ (scanning.md, actions.md, sources.md)
  manage-project-skills/SKILL.md      + references/ (scanning.md, actions.md)
  yp-status/SKILL.md
  yp-context/SKILL.md
  yp-session/SKILL.md
  yp-reload/SKILL.md
  yp-help/SKILL.md
  yp-notes/SKILL.md
  yp-remember/SKILL.md
  yp-forget/SKILL.md
  scaffold-skill/SKILL.md             + references/ (template.md, checklist.md)
  validate-skill/SKILL.md             + references/ (checks.md)
  yp-compress/SKILL.md                + references/ (rules.md)
  yp-diagnose/SKILL.md                + references/ (standards.md, checks.md, remediation.md)
  yp-tasks/SKILL.md                   + references/ (format.md, worktree-protocol.md, pickup.md)
  auto-plan/SKILL.md                  + references/ (decomposition.md, format.md)

skills/yellowpages/
  (mirrors of all above — identical content)

packages/yp-stack/src/
  skills-manager.js                   installSkillsManager / uninstallSkillsManager
```

### Modified files

```
packages/yp-stack/src/index.js        Add skills-manager install step (before caveman prompt)
packages/yp-stack/bin/cli.js          Add --uninstall skills-manager flag
.agents/skills/yellowpages/INDEX.md   Add 16 new skill entries (may need INDEX split)
skills/yellowpages/INDEX.md           Same
.agents/project-context.md            Add note: skills manager active, /help for commands
README.md                             Add skills manager section
```

---

## `npx yp-stack` Changes

### `packages/yp-stack/src/skills-manager.js`

Mirrors `caveman.js` structure. Platform-to-path map for all 8 platforms. For Claude Code:
- Writes `skills-manifest.js` to `~/.claude/hooks/`
- Registers SessionStart hook in `~/.claude/settings.json`
- Writes all 16 utility skills to `~/.claude/skills/`
- Writes `{"type":"module"}` to `~/.claude/hooks/package.json` (ESM, already exists)

For other agents: writes skill files to platform-specific skill paths. Manifest hook is Claude Code-only.

### Uninstall

`npx yp-stack --uninstall skills-manager`:
- Removes `skills-manifest.js` from `~/.claude/hooks/`
- Strips SessionStart entry from `~/.claude/settings.json`
- Removes 16 utility skills from `~/.claude/skills/`

---

## INDEX.md Capacity

Current `.agents/skills/yellowpages/INDEX.md` is at 30 lines (the limit). Adding 16 skills requires either:
1. Splitting into two index files: `INDEX.md` (core) and `INDEX-utilities.md`
2. Raising the limit with a documented exception

**Decision:** Split. `INDEX.md` covers the core yellowpages skill and sub-skills (the publishable set). New `INDEX-utilities.md` covers the utility/management skills. Both listed in `project-context.md`.

---

## Success Criteria

- Every Claude Code session starts with manifest injected (agent knows what's installed)
- `/help` returns a complete command reference in under 2 turns
- `/diagnose` correctly identifies yellowpages violations and emits actionable fix instructions
- `/manage global skills` shows full inventory including superpowers overlap
- `TASKS.md` format correctly blocks task pickup when dependencies unmet
- No agent can mark a task `[X]` without confirming worktree merge-back
- Skills manager installs automatically with `npx yp-stack` — no separate step
- All 16 utility skills pass yellowpages quality checklist
- `npx yp-stack --uninstall skills-manager` cleanly reverses all changes
