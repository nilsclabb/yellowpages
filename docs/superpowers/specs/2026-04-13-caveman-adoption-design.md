# Caveman Adoption Design

**Date:** 2026-04-13
**Status:** Approved
**Credit:** Concept, approach, hook architecture, rule body, toggle commands, intensity levels, and auto-clarity conventions are the work of [Julius Brussee / caveman](https://github.com/JuliusBrussee/caveman). This spec describes packaging that work into the yellowpages system.

---

## Problem

Agents working in the yellowpages repo produce verbose, filler-heavy responses to the developer — pleasantries, hedging, articles, walls of prose. This wastes tokens, slows responses, and obscures the actual answer. Written artifacts (skills, specs, docs) are fine as-is. The problem is only what the agent *says*, not what it *writes*.

## Goal

Make agents communicate with the developer in terse caveman-style prose by default, from the first session after install — without touching any written artifacts, skill files, reference docs, or code.

## Non-Goals

- Merging the caveman repo into yellowpages
- Changing how skills, specs, or reference files are written
- Distributing caveman as a standalone product
- Implementing caveman-compress, caveman-commit, or caveman-review (future additions, not in scope)

---

## Chosen Approach

**Approach B — SessionStart hook (Claude Code) + per-agent rule files + yellowpages skill.**

Hook-based activation is more robust than CLAUDE.md injection: it fires reliably every session regardless of context length, and for Claude Code it injects rules as invisible system context the developer never has to see or maintain.

---

## Architecture

### Two-File Design: Rule Body vs. Skill Reference

These two files serve different purposes and are **not** duplicates:

- **`rules/caveman-activate.md`** — the lean canonical rule body (9 lines). This is what `hooks/caveman-activate.js` reads at runtime and emits as system context. It is also what the installer reads to generate agent-specific always-on files. Never edit agent-specific copies — edit this file only.

- **`references/behavior.md`** — the human-facing skill reference. A superset of `rules/caveman-activate.md`: includes the full rule body plus intensity level definitions with before/after examples, auto-clarity trigger list, and boundary rule explanations. Not read by the hook at runtime — read by the developer and agent when understanding or modifying caveman behavior.

### Activation Per Agent

| Agent | Mechanism | Always-on method |
|---|---|---|
| Claude Code | `hooks/caveman-activate.js` (SessionStart) | Hook stdout injected as invisible system context |
| Cursor | `.cursor/rules/caveman.mdc` | `alwaysApply: true` frontmatter |
| Windsurf | `.windsurf/rules/caveman.md` | `trigger: always_on` frontmatter |
| Cline | `.clinerules/caveman.md` | Auto-discovered every session |
| Roo Code | `.roo/rules/caveman.md` | Auto-discovered |
| GitHub Copilot | `.github/copilot-instructions.md` (appended, wrapped in markers) | Repo-wide instructions |
| OpenCode | `.opencode/rules/caveman.md` | Auto-discovered |
| Generic | Manual snippet printed to terminal | Developer pastes into agent system prompt |

### Toggle Mechanism

| Agent | How toggle works |
|---|---|
| Claude Code | `hooks/caveman-mode-tracker.js` (UserPromptSubmit) reads incoming prompt, updates `~/.claude/.caveman-active` flag file |
| All others | Natural language — "stop caveman" / "normal mode" / "/caveman" |

### Mode Persistence

**Claude Code:** flag file `~/.claude/.caveman-active` persists across turns within a session. Deleted on "stop caveman". Restored to `"full"` on next SessionStart by the hook.

**All other agents:** "stop caveman" is session-local only. The always-on rule file re-activates caveman at the start of the next session — there is no cross-session off state. This asymmetry is documented in `references/toggle.md`.

---

## File Inventory

### New files

```
rules/
  caveman-activate.md                    Lean rule body (hook reads this at runtime)

hooks/                                   Claude Code only
  caveman-activate.js                    SessionStart: writes flag + injects rule body
  caveman-mode-tracker.js                UserPromptSubmit: tracks /caveman commands
  install.sh                             Patches ~/.claude/settings.json, copies hooks
  uninstall.sh                           Reverses install.sh

.agents/skills/yellowpages/caveman/      Internal yellowpages skill (correct namespace)
  SKILL.md                               Cover page (≤80 lines)
  references/
    behavior.md                          Superset of rule body + intensity definitions + examples
    toggle.md                            All toggle commands + per-agent notes + persistence asymmetry
    credit.md                            Attribution to Julius Brussee / caveman

skills/yellowpages/caveman/              Publishable copy (mirrors .agents version)
  SKILL.md
  references/
    behavior.md
    toggle.md
    credit.md
```

### Modified files

```
packages/yp-stack/src/install.js         Add caveman install step + installCaveman(platform) + uninstallCaveman(platform)
.agents/project-context.md               Add one line: caveman active by default; see skills/yellowpages/caveman/SKILL.md to toggle
.agents/skills/yellowpages/INDEX.md      Add caveman entry (29 → 30 lines, within ≤30 budget)
README.md                                Add Credits section attributing Julius Brussee / caveman
```

### Agent-specific files written by installer (not committed)

```
.cursor/rules/caveman.mdc
.windsurf/rules/caveman.md
.clinerules/caveman.md
.roo/rules/caveman.md
.opencode/rules/caveman.md
.github/copilot-instructions.md    (appended inside <!-- caveman:start --> / <!-- caveman:end --> markers)
```

---

## Skill Design

### `.agents/skills/yellowpages/caveman/SKILL.md`

Follows all five yellowpages non-negotiables:
- Cover page ≤80 lines
- Routes to references, does not duplicate their content
- Every reference link annotated with "when to read"
- One job: describe caveman state, expose toggle commands, point to detail files

### `references/behavior.md`

Human-facing skill reference (superset of `rules/caveman-activate.md`). Contains:
- Full rule body (mirrors `rules/caveman-activate.md`)
- Intensity level definitions with before/after examples:
  - **lite** — drop filler, keep grammar, professional but no fluff
  - **full** — default; drop articles, fragments ok, full grunt
  - **ultra** — maximum compression, telegraphic, abbreviate everything
- Auto-clarity trigger list (security warnings, irreversible actions, user confused)
- Boundary rules (written artifacts, code, commits always normal prose)

**Not** what the hook reads at runtime — that is `rules/caveman-activate.md`.

### `references/toggle.md`

Full command reference. Contains:
- All toggle commands and their effects
- Mode persistence rules
- Per-agent notes (hook-tracked vs natural language)
- **Persistence asymmetry:** Claude Code persists "off" until next SessionStart resets it to full; all other agents reset to caveman-on at the start of every session because the always-on rule file re-activates them. Developer cannot persistently disable caveman on non-Claude Code agents without removing the rule file.

### `references/credit.md`

Attribution. Contains:
- Full credit to Julius Brussee and the caveman repo
- Link to `https://github.com/JuliusBrussee/caveman`
- Explicit list of what was adopted (pattern, hook architecture, toggle conventions, rule body)

---

## Install Flow

### Via `npx yp-stack`

After the standard skill install, the installer presents:

```
Install caveman terse mode?
Cuts ~65% output tokens. ON by default, toggle anytime with /caveman or "stop caveman".
● Yes (recommended)
○ No
```

On **yes:** `installCaveman(platform)` reads `rules/caveman-activate.md`, applies platform-specific frontmatter, writes to the correct agent path per the table above.

On **no:** skipped. Can be installed later via `bash hooks/install.sh` (Claude Code) or re-running `npx yp-stack`.

### Via standalone script (Claude Code only)

```bash
bash hooks/install.sh    # install
bash hooks/uninstall.sh  # uninstall
```

### Uninstall via `npx yp-stack`

```bash
npx yp-stack --uninstall caveman
```

Calls `uninstallCaveman(platform)` which:

| Platform | What uninstall does |
|---|---|
| Claude Code | Runs `hooks/uninstall.sh` — removes hook entries from `~/.claude/settings.json`, deletes hook files from `~/.claude/hooks/`, deletes flag file |
| Cursor | Deletes `.cursor/rules/caveman.mdc` |
| Windsurf | Deletes `.windsurf/rules/caveman.md` |
| Cline | Deletes `.clinerules/caveman.md` |
| Roo Code | Deletes `.roo/rules/caveman.md` |
| OpenCode | Deletes `.opencode/rules/caveman.md` |
| GitHub Copilot | Strips `<!-- caveman:start -->` through `<!-- caveman:end -->` block from `.github/copilot-instructions.md` |
| Generic | Prints "remove the caveman snippet from your agent's system prompt" |

### `install.js` changes

Three additions only — no changes to `platforms.js` or existing install logic:
1. New prompt step after skill install
2. `installCaveman(platform)` function
3. `uninstallCaveman(platform)` function — exposed via `npx yp-stack --uninstall caveman`

---

## Caveman Rule Body

Sourced from `rules/caveman-activate.md` (what the hook reads at runtime):

```
Respond terse like smart caveman. All technical substance stay. Only fluff die.
Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging.
Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
Pattern: [thing] [action] [reason]. [next step].
Switch level: /caveman lite|full|ultra
Stop: "stop caveman" or "normal mode"
Auto-Clarity: drop caveman for security warnings, irreversible actions, user confused. Resume after.
Boundaries: written artifacts (skills, specs, docs, reference files) NEVER caveman.
Code/commits/PRs: normal formatting.
```

---

## Hook Safety Rules

All hook files must:
- Silent-fail on all filesystem errors (try/catch everything)
- Never block session start under any failure condition
- Never write to files outside `~/.claude/` (flag file) and `~/.claude/hooks/` (hook files)
- **Fallback rule body:** if `rules/caveman-activate.md` is missing or unreadable at runtime, `caveman-activate.js` emits a hardcoded copy of the rule body baked into the hook file itself — caveman is never silently disabled by a missing source file

---

## What Does Not Change

Explicitly out of scope — these stay exactly as they are:

- All existing skill reference files — written in full prose
- All specs and design docs — full prose
- `ETHOS.md`, `project-context.md` content — full prose
- Workflow files, checklists, templates — full prose
- Any file the agent writes — full prose always

Caveman only affects what the agent says to the developer in conversation.

---

## README Credit

```markdown
## Credits

### caveman
The terse communication style used by agents working in this repo is
directly inspired by and adopted from **[caveman](https://github.com/JuliusBrussee/caveman)**
by [Julius Brussee](https://github.com/JuliusBrussee).

> *why use many token when few token do trick*

The hook architecture, rule body, toggle commands (/caveman, "stop caveman"),
intensity levels (lite / full / ultra), and auto-clarity conventions are all
caveman's work. We've packaged them into yellowpages' skill and install system.
Go star the original. 🪨
```

---

## Success Criteria

- Agent responds in caveman mode from the first message of every session after install
- Developer can toggle mode mid-session with `/caveman`, `/caveman lite`, `/caveman ultra`, "stop caveman"
- All written artifacts (skills, specs, docs, reference files) are in normal prose — never caveman
- Install and uninstall work correctly for all 8 supported agent platforms
- Copilot append/remove uses `<!-- caveman:start -->` / `<!-- caveman:end -->` markers — idempotent
- Hook falls back to hardcoded rule body if source file is missing — caveman never silently disabled
- `SKILL.md` passes yellowpages quality checklist (≤80 lines, all references annotated, INDEX.md entry present at exactly 30 lines)
