# YP Skills Manager Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full yp-stack skills manager — 16 utility skills, a SessionStart manifest hook, an npm installer module, and a task orchestration system with TASKS.md.

**Architecture:** Skill files (SKILL.md + references/) live in `.agents/skills/yellowpages/` and mirror to `skills/yellowpages/`. Infrastructure is a SessionStart hook (`skills-manifest.js`) that injects a compact manifest every session, plus `skills-manager.js` in the npm package that installs everything. The TASKS.md format enables multi-agent parallel task execution with explicit dependency declarations and worktree isolation.

**Tech Stack:** Node.js ESM (hooks + npm installer), Markdown (skill files). No new dependencies. Follows existing caveman patterns throughout.

**Spec:** `docs/superpowers/specs/2026-04-13-yp-skills-manager-design.md`

---

## File Map

### Chunk 1 — Simple utility skills (SKILL.md only)

| Create | Purpose |
|---|---|
| `.agents/skills/yellowpages/yp-help/SKILL.md` + mirror | `/help` reference card |
| `.agents/skills/yellowpages/yp-status/SKILL.md` + mirror | `/status` session snapshot |
| `.agents/skills/yellowpages/yp-context/SKILL.md` + mirror | `/context` full transparency |
| `.agents/skills/yellowpages/yp-session/SKILL.md` + mirror | `/session` model + context pressure |
| `.agents/skills/yellowpages/yp-reload/SKILL.md` + mirror | `/reload` re-read files |
| `.agents/skills/yellowpages/yp-notes/SKILL.md` + mirror | `/notes` print CLAUDE.md |
| `.agents/skills/yellowpages/yp-remember/SKILL.md` + mirror | `/remember <fact>` append note |
| `.agents/skills/yellowpages/yp-forget/SKILL.md` + mirror | `/forget <fact>` remove note |
| `.agents/skills/yellowpages/SKILLS-INDEX.md` + mirror | Index of all 16 utility skills |

### Chunk 2 — Medium/complex skills with references

| Create | Purpose |
|---|---|
| `.agents/skills/yellowpages/scaffold-skill/` + mirror | `/scaffold skill <name>` |
| `.agents/skills/yellowpages/validate-skill/` + mirror | `/validate skill <path>` |
| `.agents/skills/yellowpages/yp-compress/` + mirror | `/compress <file>` |
| `.agents/skills/yellowpages/manage-global-skills/` + mirror | `/manage global skills` |
| `.agents/skills/yellowpages/manage-project-skills/` + mirror | `/manage project skills` |
| `.agents/skills/yellowpages/yp-diagnose/` + mirror | `/diagnose` skill doctor |

### Chunk 3 — Task orchestration skills

| Create | Purpose |
|---|---|
| `.agents/skills/yellowpages/yp-tasks/` + mirror | `/tasks` + TASKS.md format |
| `.agents/skills/yellowpages/auto-plan/` + mirror | `/auto-plan` generator |

### Chunk 4 — Infrastructure

| File | Change |
|---|---|
| `hooks/skills-manifest.js` | New SessionStart hook |
| `packages/yp-stack/src/skills-manager.js` | New: installSkillsManager + uninstallSkillsManager |
| `packages/yp-stack/src/index.js` | Add skills manager install step |
| `packages/yp-stack/bin/cli.js` | Add `--uninstall skills-manager` |
| `hooks/install.sh` | Copy skills-manifest.js + register hook |
| `hooks/uninstall.sh` | Remove skills-manifest.js + strip hook entry |
| `packages/yp-stack/src/content.js` | Regenerated via `npm run bundle` |

---

## Chunk 1: Simple Utility Skills

### Task 1: yp-help

**Files:**
- Create: `.agents/skills/yellowpages/yp-help/SKILL.md`
- Create: `skills/yellowpages/yp-help/SKILL.md` (mirror)

- [ ] **Step 1: Create directory and SKILL.md**

```bash
mkdir -p .agents/skills/yellowpages/yp-help
```

Content of `.agents/skills/yellowpages/yp-help/SKILL.md`:

```markdown
---
name: yp-help
description: Quick reference card for all yp-stack commands, caveman modes, and installed skills.
---

# /help

Quick reference for the yp-stack. One-shot display.

## yp-stack Commands

| Command | What it does |
|---|---|
| `/help` | This card |
| `/status` | Session snapshot — caveman mode, skills, project context, hook health |
| `/context` | Everything injected at session start |
| `/session` | Model, estimated context pressure, active hooks |
| `/reload` | Re-read CLAUDE.md and skills state via tool use |
| `/notes` | Print CLAUDE.md contents |
| `/remember <fact>` | Append persistent note to CLAUDE.md Agent Notes |
| `/forget <fact>` | Remove note from CLAUDE.md Agent Notes |
| `/diagnose` | Scan all skills for yellowpages compliance issues |
| `/scaffold skill <name>` | Create new yellowpages-compliant skill |
| `/validate skill <path>` | Run quality checklist on any skill |
| `/compress <file>` | Rewrite memory file in terse form (~46% token reduction) |
| `/manage global skills` | Inventory + manage globally installed skill libraries |
| `/manage project skills` | Inventory + manage current project skill context |
| `/tasks` | View, claim, and complete tasks in TASKS.md |
| `/auto-plan` | Generate TASKS.md from a description of work |

## Caveman Modes

| Command | Effect |
|---|---|
| `/caveman` | Full mode (default) |
| `/caveman full` | Full mode (explicit) |
| `/caveman lite` | Drop filler, keep grammar |
| `/caveman ultra` | Maximum compression |
| `"stop caveman"` | Normal prose (session-local on non-Claude Code) |
```

- [ ] **Step 2: Verify line count**

```bash
wc -l .agents/skills/yellowpages/yp-help/SKILL.md
```

Expected: ≤ 80 lines.

- [ ] **Step 3: Create mirror**

```bash
mkdir -p skills/yellowpages/yp-help
cp .agents/skills/yellowpages/yp-help/SKILL.md skills/yellowpages/yp-help/SKILL.md
diff .agents/skills/yellowpages/yp-help/SKILL.md skills/yellowpages/yp-help/SKILL.md
```

Expected: no diff output.

---

### Task 2: yp-status

**Files:**
- Create: `.agents/skills/yellowpages/yp-status/SKILL.md`
- Create: `skills/yellowpages/yp-status/SKILL.md` (mirror)

- [ ] **Step 1: Create SKILL.md**

```bash
mkdir -p .agents/skills/yellowpages/yp-status
```

Content of `.agents/skills/yellowpages/yp-status/SKILL.md`:

```markdown
---
name: yp-status
description: Current session snapshot — caveman mode, active skills, project context, hook health.
---

# /status

Session snapshot. Read-only.

## What to show

1. **Caveman** — read `~/.claude/.caveman-active`; report mode (full/lite/ultra) or "off"
2. **Hooks** — read `~/.claude/settings.json` hooks section; list registered SessionStart and UserPromptSubmit commands
3. **Skills manifest** — report from session-start context (already injected by skills-manifest.js)
4. **Project** — `.agents/` present?, `CLAUDE.md` present?, `TASKS.md` state if present
5. **Hook health** — verify `~/.claude/hooks/caveman-activate.js` and `~/.claude/hooks/skills-manifest.js` are readable

Format as a compact table per section. If anything is missing or unreadable, append: "Run `/diagnose` to check and repair."
```

- [ ] **Step 2: Verify + mirror**

```bash
wc -l .agents/skills/yellowpages/yp-status/SKILL.md
mkdir -p skills/yellowpages/yp-status
cp .agents/skills/yellowpages/yp-status/SKILL.md skills/yellowpages/yp-status/SKILL.md
diff .agents/skills/yellowpages/yp-status/SKILL.md skills/yellowpages/yp-status/SKILL.md
```

Expected: ≤ 80 lines, no diff.

---

### Task 3: yp-context

**Files:**
- Create: `.agents/skills/yellowpages/yp-context/SKILL.md`
- Create: `skills/yellowpages/yp-context/SKILL.md` (mirror)

- [ ] **Step 1: Create SKILL.md**

```bash
mkdir -p .agents/skills/yellowpages/yp-context
```

Content of `.agents/skills/yellowpages/yp-context/SKILL.md`:

```markdown
---
name: yp-context
description: Full transparency view — everything injected into this session at startup.
---

# /context

Show everything the agent loaded at session start. Read-only.

## What to show

1. **Hook commands** — list all SessionStart hook commands from `~/.claude/settings.json`; describe what each injects (caveman ruleset from `caveman-activate.js`, skills manifest from `skills-manifest.js`)
2. **CLAUDE.md** — read from cwd; show section headings + line count. Fall back to `~/CLAUDE.md`.
3. **project-context.md** — if `.agents/project-context.md` exists, show first 15 lines
4. **Installed skills** — list directory names under `~/.claude/skills/`
5. **Plugin context** — check `~/.claude/settings.json` enabledPlugins; list any active plugins

Nothing is modified. This is a diagnostic transparency view only.
```

- [ ] **Step 2: Verify + mirror**

```bash
wc -l .agents/skills/yellowpages/yp-context/SKILL.md
mkdir -p skills/yellowpages/yp-context
cp .agents/skills/yellowpages/yp-context/SKILL.md skills/yellowpages/yp-context/SKILL.md
diff .agents/skills/yellowpages/yp-context/SKILL.md skills/yellowpages/yp-context/SKILL.md
```

---

### Task 4: yp-session

**Files:**
- Create: `.agents/skills/yellowpages/yp-session/SKILL.md`
- Create: `skills/yellowpages/yp-session/SKILL.md` (mirror)

- [ ] **Step 1: Create SKILL.md**

```bash
mkdir -p .agents/skills/yellowpages/yp-session
```

Content of `.agents/skills/yellowpages/yp-session/SKILL.md`:

```markdown
---
name: yp-session
description: Model info, estimated context pressure, and active hooks for current session.
---

# /session

Session metadata snapshot.

## What to show

- **Model** — state current model identifier
- **Context pressure** — heuristic estimate based on conversation turn count:
  - ≤10 turns: low
  - 11–25 turns: moderate (consider `/compress` on memory files)
  - 26–40 turns: elevated (consider fresh session for complex work)
  - 40+ turns: high (context degradation likely)
  Note: exact token counts are not available to the agent — this is a heuristic only
- **Active hooks** — list from `~/.claude/settings.json` hooks section
- **Caveman mode** — read `~/.claude/.caveman-active`; report current mode or "off"
- **yp-stack version** — read from nearest `yellowpages.config.json` if found in cwd or parent directories
```

- [ ] **Step 2: Verify + mirror**

```bash
wc -l .agents/skills/yellowpages/yp-session/SKILL.md
mkdir -p skills/yellowpages/yp-session
cp .agents/skills/yellowpages/yp-session/SKILL.md skills/yellowpages/yp-session/SKILL.md
diff .agents/skills/yellowpages/yp-session/SKILL.md skills/yellowpages/yp-session/SKILL.md
```

---

### Task 5: yp-reload

**Files:**
- Create: `.agents/skills/yellowpages/yp-reload/SKILL.md`
- Create: `skills/yellowpages/yp-reload/SKILL.md` (mirror)

- [ ] **Step 1: Create SKILL.md**

```bash
mkdir -p .agents/skills/yellowpages/yp-reload
```

Content of `.agents/skills/yellowpages/yp-reload/SKILL.md`:

```markdown
---
name: yp-reload
description: Re-read CLAUDE.md and installed skills state into conversation context via tool use.
---

# /reload

Re-read current state files and report. SessionStart hooks cannot re-fire mid-session — this command uses tool use to read the files directly and show their current state.

## What to do

1. Read `CLAUDE.md` from cwd (fallback to `~/CLAUDE.md`) — show section headings + line count
2. Read `~/.claude/skills/` — list all installed skill directory names grouped by library
3. Read `.agents/project-context.md` if present — show first 10 lines
4. Read `~/.claude/.caveman-active` — report current caveman mode
5. Report summary: "State refreshed. [N] global skills visible. CLAUDE.md: [N] lines. Caveman: [mode]."

This shows *current* file state. If files changed since session start (e.g. after editing CLAUDE.md), this reflects those changes. The session-start injected context is not updated.
```

- [ ] **Step 2: Verify + mirror**

```bash
wc -l .agents/skills/yellowpages/yp-reload/SKILL.md
mkdir -p skills/yellowpages/yp-reload
cp .agents/skills/yellowpages/yp-reload/SKILL.md skills/yellowpages/yp-reload/SKILL.md
diff .agents/skills/yellowpages/yp-reload/SKILL.md skills/yellowpages/yp-reload/SKILL.md
```

---

### Task 6: yp-notes

**Files:**
- Create: `.agents/skills/yellowpages/yp-notes/SKILL.md`
- Create: `skills/yellowpages/yp-notes/SKILL.md` (mirror)

- [ ] **Step 1: Create SKILL.md**

```bash
mkdir -p .agents/skills/yellowpages/yp-notes
```

Content of `.agents/skills/yellowpages/yp-notes/SKILL.md`:

```markdown
---
name: yp-notes
description: Print current CLAUDE.md contents — make implicit agent memory explicit.
---

# /notes

Print CLAUDE.md. Read-only.

## What to do

1. Check cwd for `CLAUDE.md` — use it if found
2. Fall back to `~/CLAUDE.md` — use it if found
3. If neither found: "No CLAUDE.md found. Use `/remember <fact>` to create one."
4. Print full file contents

No modifications made.
```

- [ ] **Step 2: Verify + mirror**

```bash
wc -l .agents/skills/yellowpages/yp-notes/SKILL.md
mkdir -p skills/yellowpages/yp-notes
cp .agents/skills/yellowpages/yp-notes/SKILL.md skills/yellowpages/yp-notes/SKILL.md
diff .agents/skills/yellowpages/yp-notes/SKILL.md skills/yellowpages/yp-notes/SKILL.md
```

---

### Task 7: yp-remember

**Files:**
- Create: `.agents/skills/yellowpages/yp-remember/SKILL.md`
- Create: `skills/yellowpages/yp-remember/SKILL.md` (mirror)

- [ ] **Step 1: Create SKILL.md**

```bash
mkdir -p .agents/skills/yellowpages/yp-remember
```

Content of `.agents/skills/yellowpages/yp-remember/SKILL.md`:

```markdown
---
name: yp-remember
description: Append a persistent note to CLAUDE.md Agent Notes section for future sessions.
---

# /remember <fact>

Append a fact to CLAUDE.md. Persists across sessions.

## Target file

`CLAUDE.md` in cwd — fall back to `~/CLAUDE.md` if cwd has no CLAUDE.md.

## What to do

1. **`CLAUDE.md` absent** → create file with content: `## Agent Notes\n\n- <fact>\n`
2. **`CLAUDE.md` exists, no `## Agent Notes` section** → append `\n## Agent Notes\n\n- <fact>` to end of file
3. **`## Agent Notes` exists** → append `- <fact>` as new bullet at end of the section
4. **Exact duplicate** (bullet already present with identical text) → no-op; report: "Already noted: '<fact>'"

Confirm success: "Added to Agent Notes: '<fact>'"
```

- [ ] **Step 2: Verify + mirror**

```bash
wc -l .agents/skills/yellowpages/yp-remember/SKILL.md
mkdir -p skills/yellowpages/yp-remember
cp .agents/skills/yellowpages/yp-remember/SKILL.md skills/yellowpages/yp-remember/SKILL.md
diff .agents/skills/yellowpages/yp-remember/SKILL.md skills/yellowpages/yp-remember/SKILL.md
```

---

### Task 8: yp-forget

**Files:**
- Create: `.agents/skills/yellowpages/yp-forget/SKILL.md`
- Create: `skills/yellowpages/yp-forget/SKILL.md` (mirror)

- [ ] **Step 1: Create SKILL.md**

```bash
mkdir -p .agents/skills/yellowpages/yp-forget
```

Content of `.agents/skills/yellowpages/yp-forget/SKILL.md`:

```markdown
---
name: yp-forget
description: Remove a note from CLAUDE.md Agent Notes section.
---

# /forget <fact>

Remove a note from CLAUDE.md Agent Notes.

## Target file

Same lookup as `/remember` — cwd `CLAUDE.md`, fallback to `~/CLAUDE.md`.

## What to do

1. **`CLAUDE.md` or `## Agent Notes` absent** → "Nothing to forget. No Agent Notes found."
2. **Exact match found** → remove that bullet; if section is now empty → remove the `## Agent Notes` header too; confirm: "Removed: '<fact>'"
3. **No exact match** → fuzzy search among Agent Notes bullets:
   - No fuzzy match → "No note matching '<fact>' found."
   - One fuzzy match → confirm before removing: "Remove: '<found bullet>'? [yes/no]"
   - Multiple fuzzy matches → list all candidates; ask which to remove by number
```

- [ ] **Step 2: Verify + mirror**

```bash
wc -l .agents/skills/yellowpages/yp-forget/SKILL.md
mkdir -p skills/yellowpages/yp-forget
cp .agents/skills/yellowpages/yp-forget/SKILL.md skills/yellowpages/yp-forget/SKILL.md
diff .agents/skills/yellowpages/yp-forget/SKILL.md skills/yellowpages/yp-forget/SKILL.md
```

---

### Task 9: SKILLS-INDEX.md (both copies)

The existing `INDEX.md` is at the 30-line budget. Per the spec, new utility skills go in a separate `SKILLS-INDEX.md` (Option A).

**Files:**
- Create: `.agents/skills/yellowpages/SKILLS-INDEX.md`
- Create: `skills/yellowpages/SKILLS-INDEX.md` (mirror)

- [ ] **Step 1: Create SKILLS-INDEX.md**

Content of `.agents/skills/yellowpages/SKILLS-INDEX.md`:

```markdown
# YP Utility Skills Index

All yp-stack utility and management skills. Invoke by typing the command in any session.

## Session & Context

| Skill | Command | When to use |
|---|---|---|
| `yp-help` | `/help` | Quick reference for all commands |
| `yp-status` | `/status` | Session health check and current state |
| `yp-context` | `/context` | See everything the agent loaded at startup |
| `yp-session` | `/session` | Model info and estimated context pressure |
| `yp-reload` | `/reload` | Re-read CLAUDE.md and skills after changes |
| `yp-notes` | `/notes` | Show CLAUDE.md contents |
| `yp-remember` | `/remember <fact>` | Append persistent note to CLAUDE.md |
| `yp-forget` | `/forget <fact>` | Remove note from CLAUDE.md |

## Skill Management

| Skill | Command | When to use |
|---|---|---|
| `manage-global-skills` | `/manage global skills` | Inventory and manage globally installed libraries |
| `manage-project-skills` | `/manage project skills` | Inventory and manage current project context |
| `scaffold-skill` | `/scaffold skill <name>` | Create new yellowpages-compliant skill |
| `validate-skill` | `/validate skill <path>` | Run quality checklist on any skill |
| `yp-diagnose` | `/diagnose` | Skill doctor — find and fix compliance issues |
| `yp-compress` | `/compress <file>` | Rewrite memory file to cut input tokens ~46% |

## Task Orchestration

| Skill | Command | When to use |
|---|---|---|
| `yp-tasks` | `/tasks` | View, claim, and complete tasks in TASKS.md |
| `auto-plan` | `/auto-plan` | Generate TASKS.md from a description of work |
```

- [ ] **Step 2: Verify line count**

```bash
wc -l .agents/skills/yellowpages/SKILLS-INDEX.md
```

Expected: ≤ 35 lines. (The 16-row table with headers + 3 sections totals ~34 lines — this is a new separate file, not bound to the existing INDEX.md ≤30 budget.)

**Important:** Do NOT modify the existing `.agents/skills/yellowpages/INDEX.md` or `skills/yellowpages/INDEX.md` files. SKILLS-INDEX.md is a new file created alongside them (spec Option A). The existing INDEX.md files already have their own entries and budgets.

- [ ] **Step 3: Mirror**

```bash
cp .agents/skills/yellowpages/SKILLS-INDEX.md skills/yellowpages/SKILLS-INDEX.md
diff .agents/skills/yellowpages/SKILLS-INDEX.md skills/yellowpages/SKILLS-INDEX.md
```

Expected: no diff.

---

### Task 10: Commit Chunk 1

- [ ] **Step 1: Stage and commit**

```bash
git add \
  .agents/skills/yellowpages/yp-help/ \
  .agents/skills/yellowpages/yp-status/ \
  .agents/skills/yellowpages/yp-context/ \
  .agents/skills/yellowpages/yp-session/ \
  .agents/skills/yellowpages/yp-reload/ \
  .agents/skills/yellowpages/yp-notes/ \
  .agents/skills/yellowpages/yp-remember/ \
  .agents/skills/yellowpages/yp-forget/ \
  .agents/skills/yellowpages/SKILLS-INDEX.md \
  skills/yellowpages/yp-help/ \
  skills/yellowpages/yp-status/ \
  skills/yellowpages/yp-context/ \
  skills/yellowpages/yp-session/ \
  skills/yellowpages/yp-reload/ \
  skills/yellowpages/yp-notes/ \
  skills/yellowpages/yp-remember/ \
  skills/yellowpages/yp-forget/ \
  skills/yellowpages/SKILLS-INDEX.md
git commit -m "feat: add 8 simple utility skills + SKILLS-INDEX

yp-help, yp-status, yp-context, yp-session, yp-reload, yp-notes,
yp-remember, yp-forget — all yellowpages-compliant (≤80 lines each).
SKILLS-INDEX.md added alongside INDEX.md (Option A — keeps budget)."
```

---

## Chunk 2: Medium/Complex Skills with References

### Task 11: scaffold-skill

**Files:**
- Create: `.agents/skills/yellowpages/scaffold-skill/SKILL.md`
- Create: `.agents/skills/yellowpages/scaffold-skill/references/template.md`
- Create: `.agents/skills/yellowpages/scaffold-skill/references/checklist.md`
- Mirror all three to `skills/yellowpages/scaffold-skill/`

- [ ] **Step 1: Create directories**

```bash
mkdir -p .agents/skills/yellowpages/scaffold-skill/references
mkdir -p skills/yellowpages/scaffold-skill/references
```

- [ ] **Step 2: Create SKILL.md**

Content of `.agents/skills/yellowpages/scaffold-skill/SKILL.md`:

```markdown
---
name: scaffold-skill
description: Create a new yellowpages-compliant skill from a name and description.
---

# /scaffold skill <name>

Create a new yellowpages-compliant skill. Follows the 4-step create-skill workflow.

**Usage:** `/scaffold skill <name>` — e.g. `/scaffold skill my-api-patterns`

## What Claude does

1. Ask for a one-line description if not provided
2. Create `.agents/skills/yellowpages/<name>/` directory
3. Create `SKILL.md` using the template in `references/template.md`
4. Create `references/` subdirectory
5. Add an entry to `.agents/skills/yellowpages/SKILLS-INDEX.md` under the appropriate section
6. Create publishable mirror at `skills/yellowpages/<name>/` (identical files)
7. Run `/validate skill .agents/skills/yellowpages/<name>` to confirm compliance

Report: "Skill '<name>' scaffolded. Run `/validate skill .agents/skills/yellowpages/<name>` to verify."

## References

| File | When to read |
|---|---|
| `references/template.md` | Writing the SKILL.md content — blank template with inline guidance |
| `references/checklist.md` | Verifying the skill meets all yellowpages non-negotiables before finishing |
```

- [ ] **Step 3: Create references/template.md**

Content of `.agents/skills/yellowpages/scaffold-skill/references/template.md`:

```markdown
# Scaffold — SKILL.md Template

Copy this template when creating a new skill. Replace <placeholders>.

---

```markdown
---
name: <skill-name>          # lowercase, hyphenated, matches directory name
description: <one sentence — what this skill does and when to use it>
---

# /<trigger-command>

<2–3 sentence description of what this skill does. Written for the developer, not the agent.>

## <Main Section>

<Content goes here. This is the cover page — it routes to references, does not explain everything.
Keep total file to ≤80 lines.>

## References

| File | When to read |
|---|---|
| `references/<file>.md` | <specific reason to read this file — not just "for more info"> |
```
---

## Cover page rules

- ≤ 80 lines total (including frontmatter and blank lines)
- Frontmatter: `name:` and `description:` only
- Body routes to reference files — does not duplicate their content
- Every reference link has a "when to read" annotation
- One job: describe what the skill does, how to trigger it, where to find detail
```

- [ ] **Step 4: Create references/checklist.md**

Content of `.agents/skills/yellowpages/scaffold-skill/references/checklist.md`:

```markdown
# Scaffold — Quality Checklist

Run through before marking scaffold complete. All criteria must pass.

## SKILL.md checks

- [ ] File exists at `<path>/SKILL.md`
- [ ] Frontmatter present: starts with `---`, contains `name:` and `description:`
- [ ] `name:` value matches the skill directory name exactly
- [ ] Line count ≤ 80: `wc -l SKILL.md`
- [ ] File routes to references — no inline reference content
- [ ] All reference links have "when to read" annotation in the table

## Reference file checks (if references/ exists)

- [ ] Each file ≤ 100 lines: `wc -l references/*.md`
- [ ] Each file does one job (either routes or explains — not both)
- [ ] All linked paths resolve: every file in the references table exists on disk
- [ ] No auxiliary docs (README, CHANGELOG, etc.) inside the skill folder

## Index check

- [ ] Entry added to `SKILLS-INDEX.md` (or `INDEX.md` if applicable)

## Mirror check

- [ ] `skills/yellowpages/<name>/` exists and is identical to `.agents/` version
- [ ] `diff .agents/skills/yellowpages/<name>/ skills/yellowpages/<name>/` → no output
```

- [ ] **Step 5: Verify line counts**

```bash
wc -l .agents/skills/yellowpages/scaffold-skill/SKILL.md
wc -l .agents/skills/yellowpages/scaffold-skill/references/template.md
wc -l .agents/skills/yellowpages/scaffold-skill/references/checklist.md
```

Expected: SKILL.md ≤ 80, references ≤ 100 each.

- [ ] **Step 6: Mirror**

```bash
cp .agents/skills/yellowpages/scaffold-skill/SKILL.md skills/yellowpages/scaffold-skill/SKILL.md
cp .agents/skills/yellowpages/scaffold-skill/references/template.md skills/yellowpages/scaffold-skill/references/template.md
cp .agents/skills/yellowpages/scaffold-skill/references/checklist.md skills/yellowpages/scaffold-skill/references/checklist.md
diff -r .agents/skills/yellowpages/scaffold-skill/ skills/yellowpages/scaffold-skill/
```

Expected: no diff.

---

### Task 12: validate-skill

**Files:**
- Create: `.agents/skills/yellowpages/validate-skill/SKILL.md`
- Create: `.agents/skills/yellowpages/validate-skill/references/checks.md`
- Mirror to `skills/yellowpages/validate-skill/`

- [ ] **Step 1: Create directories and SKILL.md**

```bash
mkdir -p .agents/skills/yellowpages/validate-skill/references
mkdir -p skills/yellowpages/validate-skill/references
```

Content of `.agents/skills/yellowpages/validate-skill/SKILL.md`:

```markdown
---
name: validate-skill
description: Run the yellowpages quality checklist against a skill and report pass/fail per criterion.
---

# /validate skill <path>

Run quality checks on a skill. Read-only — does not fix issues. Use `/diagnose` for auto-remediation.

**Usage:** `/validate skill .agents/skills/yellowpages/my-skill`

## What Claude does

1. Read `<path>/SKILL.md` — if absent, report "SKILL.md not found at <path>" and stop
2. Run all checks from `references/checks.md` in order
3. For each failure: report the criterion, the actual value, and the line number
4. Summary line: "✅ [N] passed · ❌ [N] failed · ⚠️ [N] warnings"
5. If failures: "Run `/diagnose` to generate step-by-step fix instructions."

## References

| File | When to read |
|---|---|
| `references/checks.md` | The full list of checks, thresholds, and how to evaluate each one |
```

- [ ] **Step 2: Create references/checks.md**

Content of `.agents/skills/yellowpages/validate-skill/references/checks.md`:

```markdown
# Validate — Checks Reference

## Required (❌ fail if any missing)

| Check | Threshold | How to verify |
|---|---|---|
| SKILL.md exists | Present | File at `<path>/SKILL.md` |
| Frontmatter present | Both `name:` and `description:` | Check first 5 lines for `---` block |
| SKILL.md line count | ≤ 80 | `wc -l <path>/SKILL.md` |
| Routes or explains — not both | Cover page only routes | No inline reference-level content in SKILL.md |
| All reference links annotated | "when to read" column present | References table has 3 columns |

## Required when references/ exists (❌ fail if any missing)

| Check | Threshold | How to verify |
|---|---|---|
| Each reference file line count | ≤ 100 | `wc -l` each `.md` in `references/` |
| All linked paths resolve | All files exist | Check each filename in references table exists on disk |
| No auxiliary docs | Only SKILL.md, references/, scripts/, assets/ | `ls <path>/` — flag anything else |

## Recommended (⚠️ warn if missing)

| Check | Note |
|---|---|
| `name:` matches directory name | Consistency; mismatch causes confusing skill load |
| Entry in SKILLS-INDEX.md or INDEX.md | Skill is undiscoverable without it |
| Reference files each do one job | Files that both route and explain violate yellowpages rule |
```

- [ ] **Step 3: Verify line counts + mirror**

```bash
wc -l .agents/skills/yellowpages/validate-skill/SKILL.md
wc -l .agents/skills/yellowpages/validate-skill/references/checks.md
cp .agents/skills/yellowpages/validate-skill/SKILL.md skills/yellowpages/validate-skill/SKILL.md
cp .agents/skills/yellowpages/validate-skill/references/checks.md skills/yellowpages/validate-skill/references/checks.md
diff -r .agents/skills/yellowpages/validate-skill/ skills/yellowpages/validate-skill/
```

---

### Task 13: yp-compress

**Files:**
- Create: `.agents/skills/yellowpages/yp-compress/SKILL.md`
- Create: `.agents/skills/yellowpages/yp-compress/references/rules.md`
- Mirror to `skills/yellowpages/yp-compress/`

- [ ] **Step 1: Create directories and SKILL.md**

```bash
mkdir -p .agents/skills/yellowpages/yp-compress/references
mkdir -p skills/yellowpages/yp-compress/references
```

Content of `.agents/skills/yellowpages/yp-compress/SKILL.md`:

```markdown
---
name: yp-compress
description: Rewrite a memory file in terse caveman-style prose to reduce input tokens by ~46%.
---

# /compress <file>

Rewrite a memory file in terse form. Saves original as `<filename>.original.md`.

**Usage:** `/compress CLAUDE.md` or `/compress .agents/project-context.md`

## What Claude does

1. Read `<file>` — if absent, stop and report error
2. If `<filename>.original.md` already exists, ask before overwriting backup
3. Rewrite prose sections per `references/rules.md`
4. Write compressed version to `<file>` (overwrites original)
5. Write original to `<filename>.original.md`
6. Report: "Compressed <file>: [N] → [M] lines ([X]% reduction). Original saved as <filename>.original.md"
7. If reduction < 10%: warn "File already terse — minimal savings achieved."

Retry up to 2x on quality check failure, patching only the failing sections.

## References

| File | When to read |
|---|---|
| `references/rules.md` | Exact rules for what to rewrite vs. what to pass through untouched |
```

- [ ] **Step 2: Create references/rules.md**

Content of `.agents/skills/yellowpages/yp-compress/references/rules.md`:

```markdown
# Compress — Rules Reference

## Rewrite (apply terse caveman-style to prose)

- Drop articles: a, an, the
- Drop filler: just, really, basically, essentially, simply, very, quite
- Drop pleasantries: "Please note that...", "It's important to...", "Keep in mind..."
- Drop hedging: "I think", "It seems like", "You might want to consider"
- Shorten verbose phrases: "is responsible for" → "handles"; "in order to" → "to"; "is able to" → "can"
- Use fragments where meaning is unambiguous

## Never rewrite (pass through exactly)

- Headings (lines starting with `#`)
- Code blocks (content between ``` fences)
- Inline code (content between single backticks)
- URLs and markdown links (preserve full `[text](url)`)
- File paths (any string containing `/` or `\`)
- Shell commands
- Dates and version numbers (e.g. 2026-04-13, v1.2.3, v0.1.0)
- Technical identifiers: npm package names, env var names, function names
- Proper nouns: product names, company names, tool names

## Quality check (run after compression)

Verify before writing to disk:
- All headings preserved (same count as original)
- All code blocks intact (same count as original)
- All URLs/links unchanged (spot-check 3)
- Technical terms not altered (spot-check 5)
- Semantic meaning preserved for each section (spot-check 3 sections)

If any check fails: patch only failing sections and re-verify. Max 2 retries.
```

- [ ] **Step 3: Verify + mirror**

```bash
wc -l .agents/skills/yellowpages/yp-compress/SKILL.md
wc -l .agents/skills/yellowpages/yp-compress/references/rules.md
cp .agents/skills/yellowpages/yp-compress/SKILL.md skills/yellowpages/yp-compress/SKILL.md
cp .agents/skills/yellowpages/yp-compress/references/rules.md skills/yellowpages/yp-compress/references/rules.md
diff -r .agents/skills/yellowpages/yp-compress/ skills/yellowpages/yp-compress/
```

---

### Task 14: manage-global-skills

**Files:**
- Create: `.agents/skills/yellowpages/manage-global-skills/SKILL.md`
- Create: `.agents/skills/yellowpages/manage-global-skills/references/scanning.md`
- Create: `.agents/skills/yellowpages/manage-global-skills/references/actions.md`
- Create: `.agents/skills/yellowpages/manage-global-skills/references/sources.md`
- Mirror all to `skills/yellowpages/manage-global-skills/`

- [ ] **Step 1: Create directories**

```bash
mkdir -p .agents/skills/yellowpages/manage-global-skills/references
mkdir -p skills/yellowpages/manage-global-skills/references
```

- [ ] **Step 2: Create SKILL.md**

Content of `.agents/skills/yellowpages/manage-global-skills/SKILL.md`:

```markdown
---
name: manage-global-skills
description: View and manage all globally installed skill libraries — inventory, install, remove, update.
---

# /manage global skills

Full inventory and management of globally installed skills. The manifest (injected at session start) already has the summary — this skill gives the full picture and management actions.

## What Claude shows

Group `~/.claude/skills/` contents by library:
- **yellowpages** — skill dirs matching known yp-stack skill names
- **superpowers** — detected via `enabledPlugins` in `~/.claude/settings.json`
- **other** — any remaining dirs

Flag overlaps: same skill name in multiple libraries.

## Available actions

```
[1] Install a skill to ~/.claude/skills/
[2] Remove a skill from ~/.claude/skills/
[3] Update yellowpages (re-run npx yp-stack)
[4] View skill details (read SKILL.md of selected skill)
[5] Done
```

## References

| File | When to read |
|---|---|
| `references/scanning.md` | Exact paths to scan and how to identify library ownership |
| `references/actions.md` | Step-by-step for each management action (install/remove/update) |
| `references/sources.md` | Where skills come from — npm, git, local directory |
```

- [ ] **Step 3: Create references/scanning.md**

Content of `.agents/skills/yellowpages/manage-global-skills/references/scanning.md`:

```markdown
# Manage Global — Scanning Reference

## Paths to scan

| Path | What it contains |
|---|---|
| `~/.claude/skills/` | All globally installed skill directories |
| `~/.claude/settings.json` → `enabledPlugins` | Active plugins (e.g. superpowers) |
| `~/.claude/plugins/cache/` | Installed plugin directories (version + skills) |

## Identifying library ownership

**yellowpages skills** — directory name matches a known yp-stack skill name:
`caveman`, `yp-help`, `yp-status`, `yp-context`, `yp-session`, `yp-reload`,
`yp-notes`, `yp-remember`, `yp-forget`, `manage-global-skills`, `manage-project-skills`,
`scaffold-skill`, `validate-skill`, `yp-diagnose`, `yp-compress`, `yp-tasks`, `auto-plan`

**superpowers skills** — `enabledPlugins` contains a key matching `superpowers@*`;
skills are in `~/.claude/plugins/cache/claude-plugins-official/superpowers/<version>/skills/`

**other** — anything in `~/.claude/skills/` not matching the above

## Overlap detection

Two skills overlap if their directory names are identical. Report as:
`⚠ overlap: <name> (yellowpages + superpowers)`
```

- [ ] **Step 4: Create references/actions.md**

Content of `.agents/skills/yellowpages/manage-global-skills/references/actions.md`:

```markdown
# Manage Global — Actions Reference

## [1] Install a skill

Ask: "Where is the skill? (a) npm package  (b) git URL  (c) local path"
See `sources.md` for how to handle each source type.
After install: run `/validate skill ~/.claude/skills/<name>` to confirm compliance.

## [2] Remove a skill

1. Ask which skill to remove (show numbered list of non-yellowpages skills)
2. Confirm: "Remove ~/.claude/skills/<name>? This deletes all files. [yes/no]"
3. On yes: `rm -rf ~/.claude/skills/<name>`
4. Confirm removal: `ls ~/.claude/skills/<name>` → "No such file or directory"

Never remove yellowpages core skills without explicit user instruction.

## [3] Update yellowpages

Run: `npx yp-stack` — the interactive installer handles version detection and updates.
If `yellowpages.config.json` exists in cwd, the installer will use its stored platform/scope settings.

## [4] View skill details

Ask which skill to view. Read and display its `SKILL.md`.
```

- [ ] **Step 5: Create references/sources.md**

Content of `.agents/skills/yellowpages/manage-global-skills/references/sources.md`:

```markdown
# Manage Global — Sources Reference

## npm package

```bash
# Download and extract to ~/.claude/skills/<name>/
npx skills add <package-name>
# Or for yellowpages skills:
npx yp-stack
```

## git URL

```bash
# Clone into a temp dir, copy skill directory
git clone <url> /tmp/skill-source
cp -r /tmp/skill-source/<skill-dir> ~/.claude/skills/<name>
rm -rf /tmp/skill-source
```

## Local path

```bash
# Copy from local directory
cp -r /path/to/skill ~/.claude/skills/<name>
```

## After any install

Always run:
```bash
# Verify skill is well-formed
# (use /validate skill inside Claude Code)
```

Then confirm the skill appears in `/status` on next session start.
```

- [ ] **Step 6: Verify line counts + mirror**

```bash
wc -l .agents/skills/yellowpages/manage-global-skills/SKILL.md
wc -l .agents/skills/yellowpages/manage-global-skills/references/scanning.md
wc -l .agents/skills/yellowpages/manage-global-skills/references/actions.md
wc -l .agents/skills/yellowpages/manage-global-skills/references/sources.md
```

Expected: SKILL.md ≤ 80, all references ≤ 100.

```bash
for f in SKILL.md references/scanning.md references/actions.md references/sources.md; do
  cp .agents/skills/yellowpages/manage-global-skills/$f skills/yellowpages/manage-global-skills/$f
done
diff -r .agents/skills/yellowpages/manage-global-skills/ skills/yellowpages/manage-global-skills/
```

---

### Task 15: manage-project-skills

**Files:**
- Create: `.agents/skills/yellowpages/manage-project-skills/SKILL.md`
- Create: `.agents/skills/yellowpages/manage-project-skills/references/scanning.md`
- Create: `.agents/skills/yellowpages/manage-project-skills/references/actions.md`
- Mirror to `skills/yellowpages/manage-project-skills/`

- [ ] **Step 1: Create directories**

```bash
mkdir -p .agents/skills/yellowpages/manage-project-skills/references
mkdir -p skills/yellowpages/manage-project-skills/references
```

- [ ] **Step 2: Create SKILL.md**

Content of `.agents/skills/yellowpages/manage-project-skills/SKILL.md`:

```markdown
---
name: manage-project-skills
description: View and manage the current project's skill context — .agents/, CLAUDE.md, TASKS.md, and installed skills.
---

# /manage project skills

Full inventory and management of what the agent sees in the current project.

## What Claude shows

Scan from `process.cwd()`:
- `yellowpages.config.json` — platform, scope, version, install date
- `.agents/` — list skills, workflows, checklists, templates present
- `CLAUDE.md` — present?, section headings, line count
- `AGENTS.md` — present?
- `TASKS.md` — present?, task state summary (X done, Y in-progress, Z pending)

```
[1] Add a skill to this project
[2] Remove a skill from this project
[3] Edit project-context.md
[4] View what agent loads on startup (/context)
[5] Open TASKS.md
[6] Done
```

## References

| File | When to read |
|---|---|
| `references/scanning.md` | Which paths to scan and what to report for each |
| `references/actions.md` | Step-by-step for each project management action |
```

- [ ] **Step 3: Create references/scanning.md**

Content of `.agents/skills/yellowpages/manage-project-skills/references/scanning.md`:

```markdown
# Manage Project — Scanning Reference

## Paths to scan (all relative to cwd)

| Path | Report |
|---|---|
| `yellowpages.config.json` | Present/absent; if present: platform, scope, version, installedAt |
| `.agents/` | Present/absent; if present: list `skills/`, `workflows/`, `checklists/`, `templates/`, `state/` subdirs |
| `.agents/skills/` | List all skill directory names |
| `.agents/project-context.md` | Present/absent; if present: line count |
| `.agents/ETHOS.md` | Present/absent |
| `CLAUDE.md` | Present/absent; if present: line count, section headings |
| `AGENTS.md` | Present/absent |
| `TASKS.md` | Present/absent; if present: count `[X]`, `[/]`, `[ ]`, `[!]` markers |

## Formatting

Present results in a structured block. Use ✓/✗ for present/absent.
For TASKS.md: show as "[N done · N in-progress · N pending · N blocked]".
```

- [ ] **Step 4: Create references/actions.md**

Content of `.agents/skills/yellowpages/manage-project-skills/references/actions.md`:

```markdown
# Manage Project — Actions Reference

## [1] Add a skill to this project

Ask which skill to add. Options:
- From global install: list `~/.claude/skills/` dirs; copy chosen to `.agents/skills/yellowpages/<name>/`
- New skill: trigger `/scaffold skill <name>` workflow

After adding: verify `.agents/skills/yellowpages/<name>/SKILL.md` exists.

## [2] Remove a skill from this project

List `.agents/skills/` contents. Ask which to remove.
Confirm: "Remove .agents/skills/yellowpages/<name>/? [yes/no]"
On yes: `rm -rf .agents/skills/yellowpages/<name>`

## [3] Edit project-context.md

Read `.agents/project-context.md` — display current content.
Ask what to change. Apply edits using normal file write.
Remind: "project-context.md is read by the agent at every session start."

## [5] Open TASKS.md

Read and display `TASKS.md` if present.
If absent: "No TASKS.md found. Use `/auto-plan` to generate one."
```

- [ ] **Step 5: Verify + mirror**

```bash
wc -l .agents/skills/yellowpages/manage-project-skills/SKILL.md
wc -l .agents/skills/yellowpages/manage-project-skills/references/scanning.md
wc -l .agents/skills/yellowpages/manage-project-skills/references/actions.md
for f in SKILL.md references/scanning.md references/actions.md; do
  cp .agents/skills/yellowpages/manage-project-skills/$f skills/yellowpages/manage-project-skills/$f
done
diff -r .agents/skills/yellowpages/manage-project-skills/ skills/yellowpages/manage-project-skills/
```

---

### Task 16: yp-diagnose

**Files:**
- Create: `.agents/skills/yellowpages/yp-diagnose/SKILL.md`
- Create: `.agents/skills/yellowpages/yp-diagnose/references/standards.md`
- Create: `.agents/skills/yellowpages/yp-diagnose/references/checks.md`
- Create: `.agents/skills/yellowpages/yp-diagnose/references/remediation.md`
- Mirror all to `skills/yellowpages/yp-diagnose/`

- [ ] **Step 1: Create directories**

```bash
mkdir -p .agents/skills/yellowpages/yp-diagnose/references
mkdir -p skills/yellowpages/yp-diagnose/references
```

- [ ] **Step 2: Create SKILL.md**

Content of `.agents/skills/yellowpages/yp-diagnose/SKILL.md`:

```markdown
---
name: yp-diagnose
description: Scan all installed skills for yellowpages compliance violations and emit exact fix instructions.
---

# /diagnose

Skill doctor. Scans all skills and emits violations as direct agent instructions — not just a report, but actionable steps the agent can execute immediately on "yes."

## Scope

Scans: `~/.claude/skills/`, `~/.agents/skills/`, `.agents/` in cwd (if present).

## Output format

```
YP DIAGNOSE — <date>

❌ CRITICAL (<N>)
───────────────
<path>/SKILL.md  [<actual> lines · budget: 80 · over by <N>]
  EXTRACT: lines <A>–<B> → create references/<name>.md
  KEEP:    lines <C>–<D> in SKILL.md (frontmatter + routing table)
  ADD:     "when to read" annotation to each new reference link

⚠️  WARNINGS (<N>)
─────────────────
<path>/references/<file>.md
  Lines <X>, <Y>: reference links missing "when to read" annotation
  ADD: annotation column to the links table at each line

✅ HEALTHY (<N>): <comma-separated list>

Fix CRITICAL issues now? [yes / no / details]
```

On "yes": execute the EXTRACT, KEEP, ADD, CREATE instructions in order.

## References

| File | When to read |
|---|---|
| `references/standards.md` | The full yellowpages compliance rules used as the check basis |
| `references/checks.md` | Exactly what to check and how to evaluate each criterion |
| `references/remediation.md` | How to format EXTRACT/KEEP/ADD/CREATE instructions for each violation type |
```

- [ ] **Step 3: Create references/standards.md**

Content of `.agents/skills/yellowpages/yp-diagnose/references/standards.md`:

```markdown
# Diagnose — Yellowpages Standards Reference

The five non-negotiable rules every skill must follow:

1. **Cover-page brevity** — every `SKILL.md` ≤ 80 lines
2. **One job per file** — files either route (navigate) or explain (detail), never both
3. **Load on demand** — agents read sub-files only when the current task requires that branch
4. **Deep-link navigation** — every reference link includes "when to read" annotation, not bare links
5. **Self-documenting index** — every skill has an entry in `INDEX.md` or `SKILLS-INDEX.md`

## Additional checks

| Rule | Threshold |
|---|---|
| Reference files | ≤ 100 lines each |
| Frontmatter | `name:` and `description:` required |
| `name:` value | Must match directory name exactly |
| Folder contents | Only `SKILL.md`, `references/`, `scripts/`, `assets/` — no auxiliary docs |
| Reference links | All listed files must exist on disk |
| Publishable mirror | `skills/yellowpages/<name>/` must match `.agents/` version |
```

- [ ] **Step 4: Create references/checks.md**

Content of `.agents/skills/yellowpages/yp-diagnose/references/checks.md`:

```markdown
# Diagnose — Checks Reference

## Severity levels

- **❌ CRITICAL** — violates a non-negotiable rule; must be fixed
- **⚠️ WARNING** — violates a recommendation; should be fixed
- **✅ HEALTHY** — all checks pass

## Check sequence (run in this order for each skill)

1. `SKILL.md` exists → CRITICAL if missing
2. Frontmatter present (name + description) → CRITICAL if missing
3. `SKILL.md` line count → CRITICAL if > 80; record exact count
4. File routes OR explains (not both) → CRITICAL if SKILL.md contains both routing table and multi-paragraph explanations
5. All reference table links annotated with "when to read" → CRITICAL if any bare links
6. Each `references/*.md` line count → CRITICAL if > 100; record which files
7. All linked files exist on disk → WARNING if any 404
8. No auxiliary docs in skill folder → WARNING if README.md, CHANGELOG.md, etc. present
9. `name:` matches directory name → WARNING if mismatch
10. `SKILLS-INDEX.md` or `INDEX.md` entry exists → WARNING if absent
11. Publishable mirror exists and matches → WARNING if `skills/yellowpages/<name>/` absent or differs

## Scan order

1. `~/.claude/skills/` — all subdirectories
2. `~/.agents/skills/` — all subdirectories (if path exists)
3. `.agents/skills/` in cwd — all subdirectories (if `.agents/` exists in cwd)

Deduplicate by absolute path before reporting.
```

- [ ] **Step 5: Create references/remediation.md**

Content of `.agents/skills/yellowpages/yp-diagnose/references/remediation.md`:

```markdown
# Diagnose — Remediation Instruction Format

Output must be readable by both human AND agent. Use these instruction keywords:

## EXTRACT

```
EXTRACT: lines <A>–<B> → create references/<descriptive-name>.md
```

Use when SKILL.md is over 80 lines. Identify which lines contain explanatory content (not routing). Name the target file after what it explains.

## KEEP

```
KEEP: lines <C>–<D> in SKILL.md (frontmatter + routing table)
```

Always pair with EXTRACT. Specifies what stays in the cover page.

## ADD

```
ADD: "when to read" annotation to reference link on line <N>
```

Or for multiple links:
```
ADD: annotation column to links table at lines <X>, <Y>, <Z>
```

## CREATE

```
CREATE: <filename> with entry: | `<skill>` | <trigger> | [SKILL.md](<path>) |
```

Use when index entry is missing.

## REMOVE

```
REMOVE: <filename> (auxiliary doc not allowed in skill folder)
```

## FIX

```
FIX: rename `name:` value from "<current>" to "<directory-name>"
```

## Execution order

When agent executes on "yes":
1. EXTRACT operations first (create new files)
2. KEEP / truncate SKILL.md
3. ADD annotations
4. CREATE index entries
5. REMOVE auxiliary docs
6. FIX frontmatter
7. Run /validate skill <path> to confirm all checks now pass
```

- [ ] **Step 6: Verify + mirror**

```bash
wc -l .agents/skills/yellowpages/yp-diagnose/SKILL.md
wc -l .agents/skills/yellowpages/yp-diagnose/references/standards.md
wc -l .agents/skills/yellowpages/yp-diagnose/references/checks.md
wc -l .agents/skills/yellowpages/yp-diagnose/references/remediation.md
```

Expected: SKILL.md ≤ 80, all references ≤ 100.

```bash
for f in SKILL.md references/standards.md references/checks.md references/remediation.md; do
  cp .agents/skills/yellowpages/yp-diagnose/$f skills/yellowpages/yp-diagnose/$f
done
diff -r .agents/skills/yellowpages/yp-diagnose/ skills/yellowpages/yp-diagnose/
```

---

### Task 17: Commit Chunk 2

- [ ] **Step 1: Stage and commit**

```bash
git add \
  .agents/skills/yellowpages/scaffold-skill/ \
  .agents/skills/yellowpages/validate-skill/ \
  .agents/skills/yellowpages/yp-compress/ \
  .agents/skills/yellowpages/manage-global-skills/ \
  .agents/skills/yellowpages/manage-project-skills/ \
  .agents/skills/yellowpages/yp-diagnose/ \
  skills/yellowpages/scaffold-skill/ \
  skills/yellowpages/validate-skill/ \
  skills/yellowpages/yp-compress/ \
  skills/yellowpages/manage-global-skills/ \
  skills/yellowpages/manage-project-skills/ \
  skills/yellowpages/yp-diagnose/
git commit -m "feat: add 6 medium/complex skills with references

scaffold-skill, validate-skill, yp-compress, manage-global-skills,
manage-project-skills, yp-diagnose — all with SKILL.md + references/."
```

---

## Chunk 3: Task Orchestration Skills

### Task 18: yp-tasks

**Files:**
- Create: `.agents/skills/yellowpages/yp-tasks/SKILL.md`
- Create: `.agents/skills/yellowpages/yp-tasks/references/format.md`
- Create: `.agents/skills/yellowpages/yp-tasks/references/pickup-protocol.md`
- Create: `.agents/skills/yellowpages/yp-tasks/references/worktree-protocol.md`
- Mirror all to `skills/yellowpages/yp-tasks/`

- [ ] **Step 1: Create directories**

```bash
mkdir -p .agents/skills/yellowpages/yp-tasks/references
mkdir -p skills/yellowpages/yp-tasks/references
```

- [ ] **Step 2: Create SKILL.md**

Content of `.agents/skills/yellowpages/yp-tasks/SKILL.md`:

```markdown
---
name: yp-tasks
description: View, claim, and complete tasks in TASKS.md — multi-agent parallel task coordination.
---

# /tasks

Interact with `TASKS.md` task coordination file. Supports multi-agent parallel execution.

⚠️ WORKTREE RULE: Every worktree MUST be merged back to its origin branch
before marking a task [X]. Marking [X] without merging = incomplete work.
See `references/worktree-protocol.md` — non-negotiable.

## Commands

- `/tasks` — show current state of TASKS.md
- `/tasks pickup` — find and claim the next available task
- `/tasks complete` — mark current claimed task [X] (only after merge confirmation)
- `/tasks status` — summary: N done, N in-progress, N pending, N blocked

## State markers

| Marker | Meaning |
|---|---|
| `[ ]` | Not started |
| `[/]` | In progress — claimed by an agent |
| `[X]` | Complete — worktree merged, verified |
| `[!]` | Blocked — needs human or dependency failed |

## References

| File | When to read |
|---|---|
| `references/format.md` | Full TASKS.md format specification — how to write and parse task files |
| `references/pickup-protocol.md` | How to find, claim, and complete tasks (dependency resolution rules) |
| `references/worktree-protocol.md` | Mandatory worktree merge-back procedure — read before creating any worktree |
```

- [ ] **Step 3: Create references/format.md**

Content of `.agents/skills/yellowpages/yp-tasks/references/format.md`:

```markdown
# TASKS.md Format Specification

## File structure

```markdown
# Plan: <description>

_Started: YYYY-MM-DD · Branch: <branch-name>_

## Tasks

- [X] Task 1: <description>
  <optional notes>

- [/] Task 2: <description>
  depends: Task 1
  worktree: <branch-name> · agent started: <ISO timestamp>
  ⚠️  MERGE REQUIRED before marking [X]

- [ ] Task 3: <description>
  depends: Task 1

- [ ] Task 4: <description>
  depends: Task 2, Task 3

- [!] Task 5: <description>
  depends: Task 3
  blocked-reason: <explanation>
```

## Format rules (parser contract)

- **Task names must be unique** within a file — duplicate names break dependency resolution
- **`depends:` is case-sensitive** — value must match task names exactly as written
- **Missing dependency** — if a named dependency doesn't exist in the file, treat task as `[!]` with `blocked-reason: dependency "X" not found`
- **`depends:` is a single comma-separated line** — no multi-line syntax
- **`blocked-reason:` is optional** when state is `[!]` but recommended
- **Indentation** of metadata lines (`depends:`, `worktree:`, `blocked-reason:`) uses exactly 2 spaces
- **Task name extraction** — everything after the state marker and space, up to end of line; strip trailing colon: `- [ ] Task 1: description` → name is `Task 1`

## State machine

`[ ]` → `[/]` (agent claims) → `[X]` (only after worktree merged) → terminal
`[ ]` → `[!]` (blocked) → `[ ]` (human resolves) → `[/]` → `[X]`
```

- [ ] **Step 4: Create references/pickup-protocol.md**

Content of `.agents/skills/yellowpages/yp-tasks/references/pickup-protocol.md`:

```markdown
# TASKS.md Pickup Protocol

## Finding available tasks

1. Read `TASKS.md`
2. Collect all `[ ]` tasks
3. Filter: keep only tasks where all `depends:` entries are `[X]`
   - **Explicit deps**: task lists `depends: Task A, Task B` → available when all named tasks are `[X]`
   - **Sequential fallback**: no `depends:` declared → available when all tasks above it in the file are `[X]`
4. Result: the claimable task set. Multiple tasks in this set = can be worked in parallel by different agents.

## Claiming a task

1. Choose a task from the claimable set
2. Update its marker from `[ ]` to `[/]`
3. Add metadata on the next line (2-space indent):
   ```
     worktree: <branch-name> · agent started: <ISO-8601-timestamp>
     ⚠️  MERGE REQUIRED before marking [X]
   ```
4. Write the file (the timestamp + worktree name acts as a claim token for other agents)

## Completing a task

Only after confirming all worktree steps in `worktree-protocol.md`:

1. Remove the `worktree:` and `⚠️ MERGE REQUIRED` metadata lines
2. Change marker from `[/]` to `[X]`
3. Add completion note if useful: `  completed: <ISO timestamp>`

## Handling [!] blocked tasks

Blocked tasks require human intervention. Do not claim them. Leave as `[!]`.
When human resolves: change `[!]` to `[ ]` and remove `blocked-reason:`.
```

- [ ] **Step 5: Create references/worktree-protocol.md**

Content of `.agents/skills/yellowpages/yp-tasks/references/worktree-protocol.md`:

```markdown
# Worktree Protocol — Mandatory Merge-Back Procedure

⚠️ HARD REQUIREMENT: Every worktree MUST be merged back to its origin branch
before marking a task [X]. This protocol is mandatory. No exceptions.

Enforcement is instructional — no filesystem gate prevents marking [X] without
merging. The agent is expected to follow these steps faithfully. Skipping the
merge produces incomplete work that may block other agents' dependent tasks.

## Create worktree

```bash
# From the origin branch (e.g. main or feat/my-feature)
git worktree add ../worktree-<task-name> -b <worktree-branch-name>
cd ../worktree-<task-name>
```

## Work on the task

Execute the task in the worktree directory. Commit as you go.

## Merge back — mandatory checklist

Complete ALL steps before marking [X]:

- [ ] Switch to origin branch: `git checkout <origin-branch>`
- [ ] Merge worktree branch: `git merge <worktree-branch-name>`
- [ ] Resolve any merge conflicts
- [ ] Run tests on merged result and confirm passing
- [ ] Remove worktree: `git worktree remove ../worktree-<task-name>`
- [ ] Delete worktree branch: `git branch -d <worktree-branch-name>`

Only after ALL boxes are checked: mark task `[X]` in TASKS.md.

## If merge fails

Do NOT mark [X]. Instead:
1. Mark task `[!]` with `blocked-reason: merge conflict — requires manual resolution`
2. Leave worktree in place for human inspection
3. Report to the developer: what conflicted and where
```

- [ ] **Step 6: Verify + mirror**

```bash
wc -l .agents/skills/yellowpages/yp-tasks/SKILL.md
wc -l .agents/skills/yellowpages/yp-tasks/references/format.md
wc -l .agents/skills/yellowpages/yp-tasks/references/pickup-protocol.md
wc -l .agents/skills/yellowpages/yp-tasks/references/worktree-protocol.md
```

Expected: SKILL.md ≤ 80, all references ≤ 100.

```bash
for f in SKILL.md references/format.md references/pickup-protocol.md references/worktree-protocol.md; do
  cp .agents/skills/yellowpages/yp-tasks/$f skills/yellowpages/yp-tasks/$f
done
diff -r .agents/skills/yellowpages/yp-tasks/ skills/yellowpages/yp-tasks/
```

---

### Task 19: auto-plan

**Files:**
- Create: `.agents/skills/yellowpages/auto-plan/SKILL.md`
- Create: `.agents/skills/yellowpages/auto-plan/references/generation-rules.md`
- Mirror to `skills/yellowpages/auto-plan/`

- [ ] **Step 1: Create directories**

```bash
mkdir -p .agents/skills/yellowpages/auto-plan/references
mkdir -p skills/yellowpages/auto-plan/references
```

- [ ] **Step 2: Create SKILL.md**

Content of `.agents/skills/yellowpages/auto-plan/SKILL.md`:

```markdown
---
name: auto-plan
description: Generate a TASKS.md task coordination file from a description of work, problem list, or requirements.
---

# /auto-plan

Generate a `TASKS.md` from any description of work. The output enables multi-agent parallel execution via the `/tasks` pickup protocol.

**Usage:** `/auto-plan` then describe what needs to be built, or paste a list of requirements.

## What Claude does

1. Ask for a description of the work if not already provided
2. Identify independent vs. sequential tasks (see `references/generation-rules.md`)
3. Declare explicit `depends:` for tasks that require other tasks to complete first
4. Identify parallelisable tasks (tasks with no shared dependencies)
5. Write `TASKS.md` to the current project root (or ask for path)
6. Print summary: "N tasks · N can start now · N parallelisable once Task X completes"

## Output

A valid `TASKS.md` following the format in `yp-tasks/references/format.md`.

## References

| File | When to read |
|---|---|
| `references/generation-rules.md` | How to decompose work into tasks, identify dependencies, and detect parallelism |
```

- [ ] **Step 3: Create references/generation-rules.md**

Content of `.agents/skills/yellowpages/auto-plan/references/generation-rules.md`:

```markdown
# Auto-Plan — Generation Rules

## Task decomposition

Break work into tasks that are:
- **Independently executable** — one agent can do it without waiting for ongoing parallel work
- **Clearly bounded** — obvious when it's done
- **Appropriately sized** — 30 min to 4 hours per task; split larger work

## Dependency identification

A task B depends on task A when:
- B requires files, data, or outputs that A creates
- B's correctness depends on A being complete first
- B tests or validates A's output

When in doubt: prefer explicit `depends:` over relying on sequential fallback. Explicit is safer for multi-agent pickup.

## Parallelism detection

Tasks can run in parallel when:
- They have no shared `depends:` targets
- They modify different files or directories
- Their outputs don't feed into each other

Flag parallelisable groups in the summary: "Tasks 3, 4, 5 can run in parallel after Task 2."

## Task naming rules

- Names must be unique within the file
- Use descriptive names: "Implement JWT validation" not "Task 3"
- Avoid generic names that could repeat: "Write tests" → "Write tests for JWT validation"

## File header

Always include:
```markdown
# Plan: <one-line description>

_Started: <YYYY-MM-DD> · Branch: <current-branch-name>_

## Tasks
```

## After generation

Run through the file and verify:
- All `depends:` values match actual task names exactly (case-sensitive)
- No duplicate task names
- Sequential fallback tasks (no `depends:`) are in logical order
```

- [ ] **Step 4: Verify + mirror**

```bash
wc -l .agents/skills/yellowpages/auto-plan/SKILL.md
wc -l .agents/skills/yellowpages/auto-plan/references/generation-rules.md
cp .agents/skills/yellowpages/auto-plan/SKILL.md skills/yellowpages/auto-plan/SKILL.md
cp .agents/skills/yellowpages/auto-plan/references/generation-rules.md skills/yellowpages/auto-plan/references/generation-rules.md
diff -r .agents/skills/yellowpages/auto-plan/ skills/yellowpages/auto-plan/
```

---

### Task 20: Commit Chunk 3

- [ ] **Step 1: Stage and commit**

```bash
git add \
  .agents/skills/yellowpages/yp-tasks/ \
  .agents/skills/yellowpages/auto-plan/ \
  skills/yellowpages/yp-tasks/ \
  skills/yellowpages/auto-plan/
git commit -m "feat: add task orchestration skills (yp-tasks, auto-plan)

yp-tasks: TASKS.md format, pickup protocol, mandatory worktree merge-back.
auto-plan: task decomposition rules and generation guidance.
Multi-agent parallel execution with explicit dependency declarations."
```

---

## Chunk 4: Infrastructure

### Task 21: hooks/skills-manifest.js

**Files:**
- Create: `hooks/skills-manifest.js`

- [ ] **Step 1: Create the hook**

Content of `hooks/skills-manifest.js`:

```javascript
#!/usr/bin/env node
/**
 * skills-manifest.js — SessionStart hook
 *
 * Scans global and project skill directories. Emits a compact manifest
 * as invisible system context (Claude reads it, developer never sees it).
 *
 * Read-only scan. Silent-fails on all errors — must never block session start.
 * If scan fails entirely, emits a fallback manifest.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const HOME = os.homedir();
const CWD = process.cwd();

// Fallback emitted if scan fails completely
const FALLBACK = '[YP · manifest scan failed · /diagnose to check]';

// Known yp-stack skill names (used to identify yellowpages skills)
const YP_SKILLS = new Set([
  'caveman','yp-help','yp-status','yp-context','yp-session','yp-reload',
  'yp-notes','yp-remember','yp-forget','manage-global-skills','manage-project-skills',
  'scaffold-skill','validate-skill','yp-diagnose','yp-compress','yp-tasks','auto-plan',
  'convex-patterns','frontend-architecture','preferred-stack','ui-component-system','monorepo-setup',
]);

function listDirs(p) {
  try { return fs.readdirSync(p).filter(n => fs.statSync(path.join(p, n)).isDirectory()); }
  catch { return []; }
}

function fileExists(p) {
  try { return fs.existsSync(p); }
  catch { return false; }
}

function readConfig() {
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(CWD, 'yellowpages.config.json'), 'utf-8'));
    return cfg;
  } catch { return null; }
}

function countTaskStates(tasksPath) {
  try {
    const content = fs.readFileSync(tasksPath, 'utf-8');
    const done = (content.match(/- \[X\]/g) || []).length;
    const inProgress = (content.match(/- \[\/\]/g) || []).length;
    const pending = (content.match(/- \[ \]/g) || []).length;
    const blocked = (content.match(/- \[!\]/g) || []).length;
    return { done, inProgress, pending, blocked };
  } catch { return null; }
}

try {
  // Determine skill path from config or default
  const config = readConfig();
  const skillsBase = config?.skillPath
    ? path.join(CWD, config.skillPath)
    : path.join(HOME, '.claude', 'skills');

  // Layer 1: yellowpages skills
  const ypSkillsPath = path.join(skillsBase, 'yellowpages');
  const installedYP = listDirs(ypSkillsPath).filter(n => YP_SKILLS.has(n));

  // Layer 2: all global skills
  const allGlobal = listDirs(skillsBase);
  const ypCount = installedYP.length;
  // Detect superpowers from settings.json
  let superpowersCount = 0;
  try {
    const settings = JSON.parse(fs.readFileSync(path.join(HOME, '.claude', 'settings.json'), 'utf-8'));
    const plugins = settings.enabledPlugins || {};
    if (Object.keys(plugins).some(k => k.startsWith('superpowers'))) {
      superpowersCount = 15; // known count
    }
  } catch {}
  const otherCount = allGlobal.filter(n => !YP_SKILLS.has(n) && n !== 'yellowpages').length;

  // Layer 3: project context
  const hasAgents = fileExists(path.join(CWD, '.agents'));
  const hasClaude = fileExists(path.join(CWD, 'CLAUDE.md'));
  const hasConfig = fileExists(path.join(CWD, 'yellowpages.config.json'));
  const tasksPath = path.join(CWD, 'TASKS.md');
  const hasTasks = fileExists(tasksPath);
  const taskStates = hasTasks ? countTaskStates(tasksPath) : null;

  // Build manifest lines
  const ypLine = `[YP v${config?.version || '?'} · global: ${installedYP.join('✓ ')}${installedYP.length ? '✓' : 'none installed'}]`;
  const overlapWarning = ''; // TODO: detect overlaps in future iteration
  const globalLine = `[GLOBAL: yellowpages(${ypCount}) superpowers(${superpowersCount}) other(${otherCount})${overlapWarning}]`;
  const projectParts = [
    hasAgents ? '.agents/✓' : '.agents/✗',
    hasClaude ? 'CLAUDE.md✓' : 'CLAUDE.md✗',
    hasConfig ? `yp-config✓ platform:${config?.platform || '?'}` : 'yp-config✗',
    taskStates ? `TASKS.md: ${taskStates.done} done · ${taskStates.inProgress} in-progress · ${taskStates.pending} pending` : '',
  ].filter(Boolean).join(' · ');
  const projectLine = `[PROJECT: ${projectParts}]`;
  const cmdLine = '[COMMANDS: /help /status /context /session /diagnose /scaffold /validate /compress /manage /remember /forget /notes /reload /tasks /auto-plan]';

  process.stdout.write([ypLine, globalLine, projectLine, cmdLine].join('\n') + '\n');
} catch {
  process.stdout.write(FALLBACK + '\n');
}
```

- [ ] **Step 2: Verify the hook runs without errors**

```bash
node hooks/skills-manifest.js
```

Expected: 4 lines of manifest output, no errors.

- [ ] **Step 3: Verify it always exits 0 even if ~/.claude doesn't exist**

```bash
HOME=/nonexistent node hooks/skills-manifest.js; echo "exit: $?"
```

Expected: fallback line + `exit: 0`.

---

### Task 22: packages/yp-stack/src/skills-manager.js

**Files:**
- Create: `packages/yp-stack/src/skills-manager.js`

- [ ] **Step 1: Create skills-manager.js**

Content of `packages/yp-stack/src/skills-manager.js`:

```javascript
/**
 * skills-manager.js — YP Skills Manager installer for yp-stack
 *
 * Exports installSkillsManager(platform, cwd) and
 * uninstallSkillsManager(platform, cwd).
 *
 * installSkillsManager is called from index.js after installFiles —
 * same call-site pattern as installCaveman.
 *
 * Hook content is bundled as a string constant (MANIFEST_HOOK) so this
 * module works from the npm cache without needing the repo's hooks/ directory.
 * Keep MANIFEST_HOOK in sync with hooks/skills-manifest.js when updating.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// ─── Bundled hook content ────────────────────────────────────────────────────

// NOTE: Keep this in sync with hooks/skills-manifest.js
export const MANIFEST_HOOK = `#!/usr/bin/env node
/**
 * skills-manifest.js — SessionStart hook (bundled by yp-stack npm package)
 * Keep in sync with hooks/skills-manifest.js in the yellowpages repo.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const HOME = os.homedir();
const CWD = process.cwd();
const FALLBACK = '[YP · manifest scan failed · /diagnose to check]';
const YP_SKILLS = new Set(['caveman','yp-help','yp-status','yp-context','yp-session','yp-reload','yp-notes','yp-remember','yp-forget','manage-global-skills','manage-project-skills','scaffold-skill','validate-skill','yp-diagnose','yp-compress','yp-tasks','auto-plan','convex-patterns','frontend-architecture','preferred-stack','ui-component-system','monorepo-setup']);
function listDirs(p){try{return fs.readdirSync(p).filter(n=>fs.statSync(path.join(p,n)).isDirectory());}catch{return[];}}
function fileExists(p){try{return fs.existsSync(p);}catch{return false;}}
function readConfig(){try{return JSON.parse(fs.readFileSync(path.join(CWD,'yellowpages.config.json'),'utf-8'));}catch{return null;}}
function countTaskStates(p){try{const c=fs.readFileSync(p,'utf-8');return{done:(c.match(/- \\[X\\]/g)||[]).length,inProgress:(c.match(/- \\[\\/\\]/g)||[]).length,pending:(c.match(/- \\[ \\]/g)||[]).length};}catch{return null;}}
try{
  const config=readConfig();
  const skillsBase=config?.skillPath?path.join(CWD,config.skillPath):path.join(HOME,'.claude','skills');
  const installedYP=listDirs(path.join(skillsBase,'yellowpages')).filter(n=>YP_SKILLS.has(n));
  const allGlobal=listDirs(skillsBase);
  let spCount=0;
  try{const s=JSON.parse(fs.readFileSync(path.join(HOME,'.claude','settings.json'),'utf-8'));if(Object.keys(s.enabledPlugins||{}).some(k=>k.startsWith('superpowers')))spCount=15;}catch{}
  const otherCount=allGlobal.filter(n=>!YP_SKILLS.has(n)&&n!=='yellowpages').length;
  const hasAgents=fileExists(path.join(CWD,'.agents'));
  const hasClaude=fileExists(path.join(CWD,'CLAUDE.md'));
  const hasConfig=fileExists(path.join(CWD,'yellowpages.config.json'));
  const tasksPath=path.join(CWD,'TASKS.md');
  const ts=fileExists(tasksPath)?countTaskStates(tasksPath):null;
  const l1=\`[YP v\${config?.version||'?'} · \${installedYP.length?installedYP.join('✓ ')+'✓':'no yp skills installed'}]\`;
  const l2=\`[GLOBAL: yellowpages(\${installedYP.length}) superpowers(\${spCount}) other(\${otherCount})]\`;
  const pp=[hasAgents?'.agents/✓':'.agents/✗',hasClaude?'CLAUDE.md✓':'CLAUDE.md✗',hasConfig?'yp-config✓':'yp-config✗',ts?\`TASKS.md: \${ts.done} done · \${ts.inProgress} in-progress · \${ts.pending} pending\`:''].filter(Boolean).join(' · ');
  const l3=\`[PROJECT: \${pp}]\`;
  const l4='[COMMANDS: /help /status /context /session /diagnose /scaffold /validate /compress /manage /remember /forget /notes /reload /tasks /auto-plan]';
  process.stdout.write([l1,l2,l3,l4].join('\\n')+'\\n');
}catch{process.stdout.write(FALLBACK+'\\n');}
`;

// ─── Install ─────────────────────────────────────────────────────────────────

export function installSkillsManager(platform, cwd = process.cwd()) {
  if (platform === 'claude') {
    _installClaudeCode();
  }
  // Skill files are already installed by installFiles() via content.js FILES map.
  // No per-platform rule files needed — skill dirs are enough.
  // cwd parameter kept for API symmetry with installCaveman(platform, cwd).
}

function _installClaudeCode() {
  const hooksDir = path.join(os.homedir(), '.claude', 'hooks');
  const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
  const manifestCmd = `node ${path.join(hooksDir, 'skills-manifest.js')}`;

  // Ensure hooks dir + package.json
  fs.mkdirSync(hooksDir, { recursive: true });
  const pkgPath = path.join(hooksDir, 'package.json');
  let pkg = {};
  try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')); } catch {}
  if (pkg.type !== 'module') {
    pkg.type = 'module';
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  }

  // Write hook file
  fs.writeFileSync(path.join(hooksDir, 'skills-manifest.js'), MANIFEST_HOOK, 'utf-8');

  // Patch settings.json — idempotent (hasCmd check)
  let settings = {};
  try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8')); } catch {}
  settings.hooks ??= {};
  settings.hooks.SessionStart ??= [];
  const hasCmd = (arr, cmd) => arr.some(h => (h?.hooks ?? []).some(e => e?.command === cmd));
  if (!hasCmd(settings.hooks.SessionStart, manifestCmd)) {
    settings.hooks.SessionStart.push({ hooks: [{ type: 'command', command: manifestCmd }] });
  }
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
}

// ─── Uninstall ───────────────────────────────────────────────────────────────

export function uninstallSkillsManager(platform, cwd = process.cwd()) {
  if (platform === 'claude') {
    _uninstallClaudeCode();
  }
  // Derive skill path from yellowpages.config.json (same logic as installFiles in install.js)
  // Falls back to platform default global path if config absent
  let skillPathAbsolute;
  try {
    const config = JSON.parse(fs.readFileSync(path.join(cwd, 'yellowpages.config.json'), 'utf-8'));
    const isGlobal = config.installLocation === 'global';
    if (isGlobal) {
      const { getPlatform } = await import('./platforms.js');
      const platformDef = getPlatform(platform);
      skillPathAbsolute = platformDef?.globalSkillPath ?? path.join(os.homedir(), '.claude', 'skills');
    } else {
      const { getPlatform } = await import('./platforms.js');
      const platformDef = getPlatform(platform);
      skillPathAbsolute = path.join(cwd, platformDef?.skillPath ?? '.claude/skills');
    }
  } catch {
    // No config — fall back to global default for the platform
    const { getPlatform } = await import('./platforms.js');
    const platformDef = getPlatform(platform);
    skillPathAbsolute = platformDef?.globalSkillPath ?? path.join(os.homedir(), '.claude', 'skills');
  }
  // Remove skill directories written to skillPathAbsolute/yellowpages/<utility-skill-name>
  const YP_UTILITY_SKILLS = [
    'yp-help','yp-status','yp-context','yp-session','yp-reload','yp-notes',
    'yp-remember','yp-forget','manage-global-skills','manage-project-skills',
    'scaffold-skill','validate-skill','yp-diagnose','yp-compress','yp-tasks','auto-plan',
  ];
  for (const name of YP_UTILITY_SKILLS) {
    const dir = path.join(skillPathAbsolute, 'yellowpages', name);
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
  }
}

function _uninstallClaudeCode() {
  const hooksDir = path.join(os.homedir(), '.claude', 'hooks');
  const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
  const manifestCmd = `node ${path.join(hooksDir, 'skills-manifest.js')}`;

  // Remove hook file
  try { fs.unlinkSync(path.join(hooksDir, 'skills-manifest.js')); } catch {}

  // Strip hook entry from settings.json
  let settings = {};
  try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8')); } catch { return; }
  const removeCmd = (arr, cmd) =>
    (arr ?? [])
      .map(h => ({ ...h, hooks: (h.hooks ?? []).filter(e => e?.command !== cmd) }))
      .filter(h => h.hooks.length > 0);
  if (settings.hooks) {
    settings.hooks.SessionStart = removeCmd(settings.hooks.SessionStart, manifestCmd);
  }
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
}
```

- [ ] **Step 2: Verify module parses**

```bash
cd packages/yp-stack
node --input-type=module <<'EOF'
import { MANIFEST_HOOK, installSkillsManager, uninstallSkillsManager } from './src/skills-manager.js';
console.log('MANIFEST_HOOK length:', MANIFEST_HOOK.length);
console.log('installSkillsManager:', typeof installSkillsManager);
console.log('uninstallSkillsManager:', typeof uninstallSkillsManager);
EOF
```

Expected:
```
MANIFEST_HOOK length: <some positive number>
installSkillsManager: function
uninstallSkillsManager: function
```

---

### Task 23: Update packages/yp-stack/src/index.js

Add the skills manager install call after `installFiles` completes and before the caveman prompt. Read current `index.js` to find the exact insertion point.

**Files:**
- Modify: `packages/yp-stack/src/index.js`

- [ ] **Step 1: Add import**

In `packages/yp-stack/src/index.js`, add to the existing import block (after `import { installCaveman } from './caveman.js';`):

```javascript
import { installSkillsManager } from './skills-manager.js';
```

- [ ] **Step 2: Add install call**

Find the line `spinner.stop('Installation complete');` (currently around line 305). Immediately before the caveman prompt block (the `console.log()` + `p.confirm` for caveman), add:

```javascript
    // ── Skills manager (core — always installed) ──
    try {
      installSkillsManager(platform, cwd);
    } catch {
      p.log.warn('Skills manager install failed — run npx yp-stack again to retry.');
    }
```

- [ ] **Step 3: Verify index.js parses**

```bash
cd packages/yp-stack
node --input-type=module --eval "import('./src/index.js').then(() => console.log('OK'))"
```

Expected: `OK`

---

### Task 24: Update packages/yp-stack/bin/cli.js

Add `--uninstall skills-manager` handling before `main()`.

**Files:**
- Modify: `packages/yp-stack/bin/cli.js`

- [ ] **Step 1: Add import and flag check**

In `packages/yp-stack/bin/cli.js`, add after the existing `--uninstall caveman` block (currently ends around line 20):

```javascript
// ── --uninstall skills-manager ───────────────────────────────────────────────
if (process.argv.includes('--uninstall') && process.argv.includes('skills-manager')) {
  const cwd = process.cwd();
  let platform = null;
  try {
    const config = JSON.parse(fs.readFileSync(path.join(cwd, 'yellowpages.config.json'), 'utf-8'));
    if (config.platform) platform = config.platform;
  } catch {}
  // Fall back to auto-detection (not a prompt — mirrors existing caveman uninstall pattern)
  if (!platform) {
    const detected = detectPlatforms(cwd);
    platform = detected[0] ?? 'generic';
  }
  try {
    const { uninstallSkillsManager } = await import('../src/skills-manager.js');
    // Pass cwd — uninstallSkillsManager reads config internally to resolve global vs. project path
    uninstallSkillsManager(platform, cwd);
    console.log(`Skills manager uninstalled (platform: ${platform}).`);
  } catch (err) {
    console.error('Skills manager uninstall failed:', err.message);
    process.exit(1);
  }
  process.exit(0);
}
```

Also add missing imports at top of `cli.js` if not already present:
```javascript
import os from 'node:os';
import { getPlatform } from '../src/platforms.js';
```

- [ ] **Step 2: Verify cli.js parses**

```bash
node --check packages/yp-stack/bin/cli.js && echo "Syntax OK"
```

Expected: `Syntax OK`

---

### Task 25: Update hooks/install.sh and hooks/uninstall.sh

**Files:**
- Modify: `hooks/install.sh`
- Modify: `hooks/uninstall.sh`

- [ ] **Step 1: Update install.sh**

In `hooks/install.sh`, after the line `cp "$SCRIPT_DIR/caveman-mode-tracker.js" "$HOOKS_DIR/caveman-mode-tracker.js"` (anchor line), add:

```bash
cp "$SCRIPT_DIR/skills-manifest.js" "$HOOKS_DIR/skills-manifest.js"
echo "  ✓ skills-manifest.js copied to $HOOKS_DIR"
```

In the Node.js heredoc, after the line `const trackerCmd = \`node ...\`` (anchor), add:

```javascript
const manifestCmd = `node ${path.join(hooksDir, 'skills-manifest.js')}`;
```

Then after the `if (!hasCmd(settings.hooks.SessionStart, activateCmd))` block (anchor: the existing block ends with `})`), add:

```javascript
if (!hasCmd(settings.hooks.SessionStart, manifestCmd)) {
  settings.hooks.SessionStart.push({ hooks: [{ type: 'command', command: manifestCmd }] });
}
```

- [ ] **Step 2: Update uninstall.sh**

In `hooks/uninstall.sh`, after `rm -f "$HOOKS_DIR/caveman-mode-tracker.js"`, add:

```bash
rm -f "$HOOKS_DIR/skills-manifest.js"
```

In the Node.js heredoc that cleans `settings.json`, add:

```javascript
const manifestCmd = `node ${path.join(hooksDir, 'skills-manifest.js')}`;
// ... in the removeCmd calls ...
settings.hooks.SessionStart = removeCmd(settings.hooks.SessionStart, manifestCmd);
```

- [ ] **Step 3: Verify syntax**

```bash
bash -n hooks/install.sh && echo "install.sh OK"
bash -n hooks/uninstall.sh && echo "uninstall.sh OK"
```

Expected: both print `OK`.

---

### Task 26: Regenerate content.js

The 16 new skill directories need to be bundled into `content.js` so `npx yp-stack` can install them without the repo being present.

**Files:**
- Regenerate: `packages/yp-stack/src/content.js` (via `npm run bundle`)

- [ ] **Step 1: Run bundle script**

```bash
cd packages/yp-stack
npm run bundle
```

Expected: script runs without errors, `src/content.js` is regenerated.

- [ ] **Step 2: Verify all 16 new skills are in content.js**

```bash
for skill in yp-help yp-status yp-context yp-session yp-reload yp-notes \
  yp-remember yp-forget manage-global-skills manage-project-skills \
  scaffold-skill validate-skill yp-diagnose yp-compress yp-tasks auto-plan; do
  count=$(grep -c "skills/yellowpages/$skill" packages/yp-stack/src/content.js 2>/dev/null || echo 0)
  echo "$skill: $count"
done
```

Expected: every skill shows `1` or more. Any `0` means that skill's files were not bundled — re-run `npm run bundle` and check that the skill directory exists under `skills/yellowpages/`.

---

### Task 27: Final verification + Chunk 4 commit

- [ ] **Step 1: Verify all infrastructure files exist**

```bash
ls hooks/skills-manifest.js
ls packages/yp-stack/src/skills-manager.js
```

- [ ] **Step 2: Verify hook produces 4 lines**

```bash
node hooks/skills-manifest.js | wc -l
```

Expected: `4`

- [ ] **Step 3: Verify skills-manager module**

```bash
cd packages/yp-stack
node --input-type=module <<'EOF'
import { installSkillsManager, uninstallSkillsManager } from './src/skills-manager.js';
console.log('OK:', typeof installSkillsManager, typeof uninstallSkillsManager);
EOF
```

Expected: `OK: function function`

- [ ] **Step 4: Verify index.js and cli.js parse**

```bash
cd packages/yp-stack
node --input-type=module --eval "import('./src/index.js').then(() => console.log('index OK'))"
node --check bin/cli.js && echo "cli OK"
```

- [ ] **Step 5: Commit Chunk 4**

```bash
git add \
  hooks/skills-manifest.js \
  hooks/install.sh \
  hooks/uninstall.sh \
  packages/yp-stack/src/skills-manager.js \
  packages/yp-stack/src/index.js \
  packages/yp-stack/bin/cli.js \
  packages/yp-stack/src/content.js
git commit -m "feat: add skills manager infrastructure

hooks/skills-manifest.js — SessionStart hook, scans 3 layers, injects manifest.
packages/yp-stack/src/skills-manager.js — installSkillsManager / uninstallSkillsManager.
index.js — skills manager installed as core step (before caveman prompt).
bin/cli.js — --uninstall skills-manager flag added.
install.sh / uninstall.sh — skills-manifest.js wired in.
content.js — regenerated with all 16 new skill files bundled."
```
