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

### Single Source of Truth

`rules/caveman-activate.md` — the canonical rule body. All agent-specific always-on files are generated from this file by the installer. Never edit agent-specific copies directly.

### Activation Per Agent

| Agent | Mechanism | Always-on method |
|---|---|---|
| Claude Code | `hooks/caveman-activate.js` (SessionStart) | Hook stdout injected as invisible system context |
| Cursor | `.cursor/rules/caveman.mdc` | `alwaysApply: true` frontmatter |
| Windsurf | `.windsurf/rules/caveman.md` | `trigger: always_on` frontmatter |
| Cline | `.clinerules/caveman.md` | Auto-discovered every session |
| Roo Code | `.roo/rules/caveman.md` | Auto-discovered |
| GitHub Copilot | `.github/copilot-instructions.md` (appended) | Repo-wide instructions |
| OpenCode / Generic | Manual snippet printed to terminal | Developer pastes into agent system prompt |

### Toggle Mechanism

| Agent | How toggle works |
|---|---|
| Claude Code | `hooks/caveman-mode-tracker.js` (UserPromptSubmit) reads incoming prompt, updates `~/.claude/.caveman-active` flag file |
| All others | Natural language — "stop caveman" / "normal mode" / "/caveman" |

### Mode Persistence

Claude Code: flag file `~/.claude/.caveman-active` persists across turns. Deleted on "stop caveman". Restored to `"full"` on next SessionStart.

All other agents: mode persists until changed within the session. Resets on next session.

---

## File Inventory

### New files

```
rules/
  caveman-activate.md              Source of truth for always-on rule body

hooks/                             Claude Code only
  caveman-activate.js              SessionStart: writes flag + injects ruleset
  caveman-mode-tracker.js          UserPromptSubmit: tracks /caveman commands
  install.sh                       Patches ~/.claude/settings.json, copies hooks
  uninstall.sh                     Reverses install.sh

.agents/skills/caveman/            Internal yellowpages skill
  SKILL.md                         Cover page (≤80 lines)
  references/
    behavior.md                    Full ruleset with intensity level definitions
    toggle.md                      All toggle commands + per-agent notes
    credit.md                      Attribution to Julius Brussee / caveman

skills/caveman/                    Publishable copy (mirrors .agents version)
  SKILL.md
  references/
    behavior.md
    toggle.md
    credit.md
```

### Modified files

```
packages/yp-stack/src/install.js   Add caveman install step + installCaveman(platform) + uninstallCaveman(platform)
.agents/project-context.md         Add one line: caveman active by default; see skills/caveman/SKILL.md to toggle
.agents/skills/yellowpages/INDEX.md  Add caveman entry
README.md                          Add Credits section attributing Julius Brussee / caveman
```

### Agent-specific files written by installer (not committed)

```
.cursor/rules/caveman.mdc
.windsurf/rules/caveman.md
.clinerules/caveman.md
.roo/rules/caveman.md
.github/copilot-instructions.md    (appended, not overwritten)
```

---

## Skill Design

### `.agents/skills/caveman/SKILL.md`

Follows all five yellowpages non-negotiables:
- Cover page ≤80 lines
- Routes to references, does not duplicate their content
- Every reference link annotated with "when to read"
- One job: describe caveman state, expose toggle commands, point to detail files

### `references/behavior.md`

Authoritative ruleset. This is what `caveman-activate.js` injects. Contains:
- Core drop rules (articles, filler, pleasantries, hedging)
- Intensity level definitions with before/after examples:
  - **lite** — drop filler, keep grammar, professional but no fluff
  - **full** — default; drop articles, fragments ok, full grunt
  - **ultra** — maximum compression, telegraphic, abbreviate everything
- Auto-clarity trigger list
- Boundary rules (written artifacts, code, commits always normal prose)

### `references/toggle.md`

Full command reference. Contains:
- All toggle commands and their effects
- Mode persistence rules
- Per-agent notes (hook-tracked vs natural language)

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

On yes: `installCaveman(platform)` reads `rules/caveman-activate.md`, applies platform-specific frontmatter, writes to the correct agent path.

On no: skipped. Can be installed later via `bash hooks/install.sh` (Claude Code) or re-running `npx yp-stack`.

### Via standalone script (Claude Code only)

```bash
bash hooks/install.sh    # install
bash hooks/uninstall.sh  # uninstall
```

### `install.js` changes

Three additions only — no changes to `platforms.js` or existing install logic:
1. New prompt step after skill install
2. `installCaveman(platform)` function
3. `uninstallCaveman(platform)` function

---

## Caveman Rule Body

Sourced from `rules/caveman-activate.md`:

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

## What Does Not Change

Explicitly out of scope — these stay exactly as they are:

- All existing skill reference files — written in full prose
- All specs and design docs — full prose
- `ETHOS.md`, `project-context.md` content — full prose
- Workflow files, checklists, templates — full prose
- Any file the agent writes — full prose always

Caveman only affects what the agent says to the developer in conversation.

---

## Hook Safety Rules

All hook files must:
- Silent-fail on all filesystem errors (try/catch everything)
- Never block session start under any failure condition
- Never write to files outside `~/.claude/` (flag file) and `~/.claude/hooks/` (hook files)

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
- Install works correctly for all 7 supported agent platforms
- Uninstall cleanly removes all caveman files and settings entries
- `SKILL.md` passes yellowpages quality checklist (≤80 lines, all references annotated, INDEX.md entry present)
