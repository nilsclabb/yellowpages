# Caveman Adoption Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adopt the caveman terse communication style into yellowpages so agents talk like caveman to developers by default, toggleable on demand, without ever affecting written artifacts.

**Architecture:** A lean rule body (`rules/caveman-activate.md`) feeds two mechanisms: a Claude Code SessionStart hook (invisible system context injection) and per-agent always-on rule files written by the installer. A yellowpages-compliant skill at `.agents/skills/yellowpages/caveman/` documents the behavior and toggle commands. The `npx yp-stack` installer handles all 8 agent platforms; a standalone `hooks/install.sh` covers Claude Code without npm.

**Tech Stack:** Node.js ESM (hooks + yp-stack), Bash (install scripts), Markdown (skill files). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-04-13-caveman-adoption-design.md`

**Credit:** Hook architecture, rule body, toggle conventions, and intensity levels by Julius Brussee / [github.com/JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman).

---

## File Map

### New files

| File | Responsibility |
|---|---|
| `rules/caveman-activate.md` | Lean 9-line rule body — what the hook emits at runtime |
| `hooks/caveman-activate.js` | SessionStart hook: writes flag file, emits rule body to stdout |
| `hooks/caveman-mode-tracker.js` | UserPromptSubmit hook: updates flag file on /caveman commands |
| `hooks/install.sh` | Standalone Claude Code installer: copies hooks, patches settings.json |
| `hooks/uninstall.sh` | Standalone Claude Code uninstaller: reverses install.sh |
| `.agents/skills/yellowpages/caveman/SKILL.md` | Cover page (≤80 lines): state, toggle commands, reference map |
| `.agents/skills/yellowpages/caveman/references/behavior.md` | Full ruleset with intensity level definitions and examples |
| `.agents/skills/yellowpages/caveman/references/toggle.md` | All toggle commands, persistence rules, per-agent notes |
| `.agents/skills/yellowpages/caveman/references/credit.md` | Attribution to Julius Brussee / caveman |
| `skills/yellowpages/caveman/SKILL.md` | Publishable mirror of .agents version (identical) |
| `skills/yellowpages/caveman/references/behavior.md` | Publishable mirror |
| `skills/yellowpages/caveman/references/toggle.md` | Publishable mirror |
| `skills/yellowpages/caveman/references/credit.md` | Publishable mirror |
| `packages/yp-stack/src/caveman.js` | Bundled rule body + hook file content + installCaveman + uninstallCaveman |

### Modified files

| File | Change |
|---|---|
| `.agents/project-context.md` | Add one line: caveman active by default, see skill to toggle |
| `.agents/skills/yellowpages/INDEX.md` | Add caveman row to Stack Skills table (29 → 30 lines) |
| `README.md` | Add Credits section for Julius Brussee / caveman |
| `packages/yp-stack/src/index.js` | Add caveman confirm prompt after main install spinner |
| `packages/yp-stack/bin/cli.js` | Add --uninstall caveman arg check before main() |

---

## Chunk 1: Content Files, Skill, and Repo Wiring

### Task 1: Create the rule body source file

**Files:**
- Create: `rules/caveman-activate.md`

- [ ] **Step 1: Create `rules/` directory and rule body file**

```bash
mkdir -p /path/to/yellowpages/rules
```

Content of `rules/caveman-activate.md`:

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

- [ ] **Step 2: Verify file exists and has exactly 9 lines**

```bash
wc -l rules/caveman-activate.md
```

Expected output: `9 rules/caveman-activate.md`

---

### Task 2: Create the skill cover page (both copies)

**Files:**
- Create: `.agents/skills/yellowpages/caveman/SKILL.md`
- Create: `skills/yellowpages/caveman/SKILL.md` (identical)

- [ ] **Step 1: Create `.agents/skills/yellowpages/caveman/SKILL.md`**

```bash
mkdir -p .agents/skills/yellowpages/caveman/references
```

Content of `.agents/skills/yellowpages/caveman/SKILL.md`:

```markdown
---
name: caveman
description: Terse agent communication mode. ON by default. Toggle anytime with /caveman or "stop caveman".
---

# caveman

why use many token when few token do trick

Caveman mode makes agent talk terse to developer. Technical substance exact. Only fluff die.

**Default: ON.** Active from first session after install.
Written artifacts (skills, specs, docs, reference files) never affected —
only what agent *says*, not what it *writes*.

## Toggle Commands

| Command | Effect |
|---|---|
| `/caveman` | Full mode (default) |
| `/caveman full` | Full mode (explicit) |
| `/caveman lite` | Drop filler, keep grammar |
| `/caveman ultra` | Maximum compression |
| `"stop caveman"` | Normal prose |
| `"normal mode"` | Normal prose |

Mode persists until changed. Resets to full on next session start.

## Auto-Clarity

Drops to normal prose for: security warnings · irreversible action
confirmations · user confused or repeating question. Resumes after.

## References

| File | When to read |
|---|---|
| `references/behavior.md` | Modifying the ruleset or understanding what the hook injects |
| `references/toggle.md` | Full command reference, intensity levels, per-agent notes, standalone install |
| `references/credit.md` | Updating attribution or adding to README |

---
*Concept and approach by [Julius Brussee](https://github.com/JuliusBrussee/caveman). Adopted into yellowpages with full credit.*
```

- [ ] **Step 2: Verify line count**

```bash
wc -l .agents/skills/yellowpages/caveman/SKILL.md
```

Expected: ≤ 80 lines.

- [ ] **Step 3: Create publishable mirror**

```bash
mkdir -p skills/yellowpages/caveman/references
cp .agents/skills/yellowpages/caveman/SKILL.md skills/yellowpages/caveman/SKILL.md
```

- [ ] **Step 4: Verify both files are identical**

```bash
diff .agents/skills/yellowpages/caveman/SKILL.md skills/yellowpages/caveman/SKILL.md
```

Expected: no output (files identical).

---

### Task 3: Create `references/behavior.md` (both copies)

**Files:**
- Create: `.agents/skills/yellowpages/caveman/references/behavior.md`
- Create: `skills/yellowpages/caveman/references/behavior.md`

- [ ] **Step 1: Create behavior.md**

Content of `.agents/skills/yellowpages/caveman/references/behavior.md`:

```markdown
# Caveman Behavior Reference

Full ruleset with intensity level definitions. Human-facing reference — not what the
hook injects at runtime (see `rules/caveman-activate.md` for the lean runtime rule body).

## Core Rules

Respond terse like smart caveman. All technical substance stay. Only fluff die.

Drop:
- Articles: a, an, the
- Filler: just, really, basically, essentially, simply
- Pleasantries: "Sure!", "Happy to help", "Great question"
- Hedging: "I think", "It seems like", "You might want to consider"

Fragments OK. Short synonyms preferred. Technical terms exact. Code unchanged.

Pattern: `[thing] [action] [reason]. [next step].`

**Not:** "Sure! I'd be happy to help. The reason your component re-renders is likely..."
**Yes:** "Component re-renders. New object ref on each render. Wrap in `useMemo`."

## Intensity Levels

### lite
Drop filler, keep grammar. Professional but no fluff.

Before: "The reason your React component is re-rendering is likely because you're
creating a new object reference on each render cycle."
After: "Your React component re-renders because you create a new object reference each
render. Wrap in `useMemo`."

### full (default)
Drop articles, use fragments, full grunt.

Before: "The reason your React component is re-rendering is likely because you're
creating a new object reference."
After: "New object ref each render. Wrap in `useMemo`."

### ultra
Maximum compression. Telegraphic. Abbreviate where unambiguous.

Before: "New object ref each render. Wrap in `useMemo`."
After: "New obj ref → re-render. `useMemo`."

## Auto-Clarity Triggers

Drop to normal prose for these. Resume caveman immediately after.

- Security warnings
- Irreversible action confirmations (deletes, force pushes, destructive migrations)
- Multi-step sequences where fragment ambiguity risks misread
- User confused or repeating same question

## Boundaries — Never Caveman

- Written artifacts: skill files, reference docs, specs, design docs
- Code (any language)
- Commit messages
- PR descriptions
- Comments in code
```

- [ ] **Step 2: Verify line count**

```bash
wc -l .agents/skills/yellowpages/caveman/references/behavior.md
```

Expected: ≤ 100 lines.

- [ ] **Step 3: Copy to publishable mirror**

```bash
cp .agents/skills/yellowpages/caveman/references/behavior.md \
   skills/yellowpages/caveman/references/behavior.md
```

- [ ] **Step 4: Verify mirrors are identical**

```bash
diff .agents/skills/yellowpages/caveman/references/behavior.md \
     skills/yellowpages/caveman/references/behavior.md
```

Expected: no output (files identical).

---

### Task 4: Create `references/toggle.md` (both copies)

**Files:**
- Create: `.agents/skills/yellowpages/caveman/references/toggle.md`
- Create: `skills/yellowpages/caveman/references/toggle.md`

- [ ] **Step 1: Create toggle.md**

Content of `.agents/skills/yellowpages/caveman/references/toggle.md`:

```markdown
# Caveman Toggle Reference

## Commands

| Command | Effect |
|---|---|
| `/caveman` | Full mode (default) |
| `/caveman full` | Full mode (explicit) |
| `/caveman lite` | Lite mode — drop filler, keep grammar |
| `/caveman ultra` | Ultra mode — maximum compression |
| `"stop caveman"` | Normal prose (session-local on non-Claude Code agents) |
| `"normal mode"` | Normal prose (session-local on non-Claude Code agents) |

## Mode Persistence

### Claude Code
Tracked via flag file `~/.claude/.caveman-active`. Persists across turns within
a session. "stop caveman" deletes the flag. Next SessionStart restores it to `full`.
There is no cross-session off state — caveman re-activates on every new session.

### All Other Agents (Cursor, Windsurf, Cline, Roo, Copilot, OpenCode)
"stop caveman" is session-local. The always-on rule file re-activates caveman
at the start of every new session. To persistently disable, remove the installed
rule file (see standalone section below).

## Standalone Install / Uninstall (Claude Code only)

For developers who cloned the repo and are not using `npx yp-stack`:

```bash
bash hooks/install.sh    # install caveman hooks
bash hooks/uninstall.sh  # remove caveman hooks
```

`install.sh` copies hook files to `~/.claude/hooks/` and patches `~/.claude/settings.json`.

## Via npx yp-stack

```bash
npx yp-stack                      # install includes caveman prompt
npx yp-stack --uninstall caveman  # remove caveman for detected/configured platform
```
```

- [ ] **Step 2: Verify line count**

```bash
wc -l .agents/skills/yellowpages/caveman/references/toggle.md
```

Expected: ≤ 100 lines.

- [ ] **Step 3: Copy to publishable mirror**

```bash
cp .agents/skills/yellowpages/caveman/references/toggle.md \
   skills/yellowpages/caveman/references/toggle.md
```

- [ ] **Step 4: Verify mirrors are identical**

```bash
diff .agents/skills/yellowpages/caveman/references/toggle.md \
     skills/yellowpages/caveman/references/toggle.md
```

Expected: no output (files identical).

---

### Task 5: Create `references/credit.md` (both copies)

**Files:**
- Create: `.agents/skills/yellowpages/caveman/references/credit.md`
- Create: `skills/yellowpages/caveman/references/credit.md`

- [ ] **Step 1: Create credit.md**

Content of `.agents/skills/yellowpages/caveman/references/credit.md`:

```markdown
# Credit

Caveman terse communication style adopted from:

**[caveman](https://github.com/JuliusBrussee/caveman)** by [Julius Brussee](https://github.com/JuliusBrussee)

> why use many token when few token do trick

## What Was Adopted

- Communication style concept and philosophy
- Hook architecture (SessionStart + UserPromptSubmit pattern)
- Lean rule body format (`rules/caveman-activate.md`)
- Toggle commands (`/caveman`, `/caveman lite`, `/caveman ultra`, "stop caveman")
- Intensity level definitions (lite / full / ultra)
- Auto-clarity conventions (drop for security warnings, irreversible actions, confused user)
- Boundary rules (written artifacts, code, commits always normal prose)
- Flag file mechanism (`~/.claude/.caveman-active`)

## What Is Different

- Packaged as a yellowpages-compliant skill (cover page + references, ≤80/100 lines)
- Installed via `npx yp-stack` alongside the yellowpages skill system
- Multi-agent installer using yellowpages' existing platform detection
- No companion skills in scope (caveman-compress, caveman-commit, caveman-review are future)

## License

The original caveman repo is MIT licensed.
```

- [ ] **Step 2: Verify line count**

```bash
wc -l .agents/skills/yellowpages/caveman/references/credit.md
```

Expected: ≤ 50 lines.

- [ ] **Step 3: Copy to publishable mirror**

```bash
cp .agents/skills/yellowpages/caveman/references/credit.md \
   skills/yellowpages/caveman/references/credit.md
```

- [ ] **Step 4: Verify mirrors are identical**

```bash
diff .agents/skills/yellowpages/caveman/references/credit.md \
     skills/yellowpages/caveman/references/credit.md
```

Expected: no output (files identical).

---

### Task 6: Update repo wiring files

**Files:**
- Modify: `.agents/skills/yellowpages/INDEX.md` (add 1 row to Stack Skills table)
- Modify: `.agents/project-context.md` (add 1 line to Global Constraints)
- Modify: `README.md` (add Credits section)

- [ ] **Step 1: Add caveman to INDEX.md Stack Skills table**

Open `.agents/skills/yellowpages/INDEX.md`. Find the Stack Skills table (currently ends with the `monorepo-setup` row). Add one row immediately after `monorepo-setup`:

```markdown
| `caveman` | "terse mode", "caveman", "toggle verbosity", "/caveman" | [caveman/SKILL.md](caveman/SKILL.md) |
```

- [ ] **Step 2: Verify INDEX.md line count is exactly 30**

```bash
wc -l .agents/skills/yellowpages/INDEX.md
```

Expected: `30 .agents/skills/yellowpages/INDEX.md`

- [ ] **Step 3: Add caveman note to project-context.md**

Open `.agents/project-context.md`. Add as a new bullet at the very end of the `## Global Constraints` list — after the last existing bullet (currently: `- Write gate status to .agents/state/gates/<workflow>.json after any multi-step workflow completes`):

```markdown
- Caveman terse mode is active by default. See `.agents/skills/yellowpages/caveman/SKILL.md` to toggle or read about intensity levels.
```

- [ ] **Step 4: Update publishable `skills/yellowpages/INDEX.md`**

The publishable INDEX (`skills/yellowpages/INDEX.md`, currently 15 lines) uses a different structure than the internal one — a single "Skills" table, not a Stack Skills section. Add caveman as a new row to the Skills table:

```markdown
| `caveman` | "terse mode", "caveman", "toggle verbosity", "/caveman" | Terse agent communication — on by default, toggle anytime |
```

Verify line count after adding:

```bash
wc -l skills/yellowpages/INDEX.md
```

Expected: 16 lines.

- [ ] **Step 5: Add Credits section to README.md**

Open `README.md`. Add the following section at the bottom (before any final lines, or as the last section):

```markdown
---

## Credits

### caveman
The terse communication style used by agents working in this repo is
directly inspired by and adopted from **[caveman](https://github.com/JuliusBrussee/caveman)**
by [Julius Brussee](https://github.com/JuliusBrussee).

> *why use many token when few token do trick*

The hook architecture, rule body, toggle commands (`/caveman`, "stop caveman"),
intensity levels (lite / full / ultra), and auto-clarity conventions are all
caveman's work. We've packaged them into yellowpages' skill and install system.
Go star the original. 🪨
```

- [ ] **Step 6: Commit Chunk 1**

```bash
git add rules/ .agents/skills/yellowpages/caveman/ skills/yellowpages/caveman/ \
        .agents/skills/yellowpages/INDEX.md skills/yellowpages/INDEX.md \
        .agents/project-context.md README.md
git commit -m "feat: add caveman skill, rule body, and repo wiring

Adopts caveman terse communication style into yellowpages.
Skill at .agents/skills/yellowpages/caveman/ + publishable mirror.
Credit: Julius Brussee / github.com/JuliusBrussee/caveman"
```

---

## Chunk 2: Hook Files and npm Installer

### Task 7: Create `hooks/caveman-activate.js` (SessionStart hook)

**Files:**
- Create: `hooks/caveman-activate.js`

- [ ] **Step 1: Create hooks directory and hook file**

```bash
mkdir -p hooks
```

Content of `hooks/caveman-activate.js`:

```javascript
#!/usr/bin/env node
/**
 * caveman-activate.js — SessionStart hook
 *
 * Writes flag file and emits caveman ruleset to stdout.
 * Claude Code injects SessionStart hook stdout as invisible system context.
 * Silent-fails on all errors — must never block session start.
 *
 * Credit: hook architecture by Julius Brussee
 * https://github.com/JuliusBrussee/caveman
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const FLAG_FILE = path.join(os.homedir(), '.claude', '.caveman-active');

// Rule body baked in. Keep in sync with rules/caveman-activate.md.
// Used as-is — no filesystem read at runtime (hook runs from ~/.claude/hooks/).
const RULE_BODY = `Respond terse like smart caveman. All technical substance stay. Only fluff die.
Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging.
Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
Pattern: [thing] [action] [reason]. [next step].
Switch level: /caveman lite|full|ultra
Stop: "stop caveman" or "normal mode"
Auto-Clarity: drop caveman for security warnings, irreversible actions, user confused. Resume after.
Boundaries: written artifacts (skills, specs, docs, reference files) NEVER caveman.
Code/commits/PRs: normal formatting.`;

try {
  // Always restore to full on SessionStart — spec: "Resets to full on next session start"
  // (stop caveman deletes the flag; /caveman lite writes 'lite' — both reset here)
  fs.mkdirSync(path.dirname(FLAG_FILE), { recursive: true });
  fs.writeFileSync(FLAG_FILE, 'full', 'utf-8');
  // Emit to stdout — Claude Code captures this as system context (invisible to user)
  process.stdout.write(RULE_BODY + '\n');
} catch {
  // Silent fail — never block session start
}
```

- [ ] **Step 2: Verify the hook runs and emits rule body**

```bash
node hooks/caveman-activate.js
```

Expected: the 9-line rule body printed to stdout. No errors.

- [ ] **Step 3: Verify flag file is created**

```bash
cat ~/.claude/.caveman-active
```

Expected: `full`

---

### Task 8: Create `hooks/caveman-mode-tracker.js` (UserPromptSubmit hook)

**Files:**
- Create: `hooks/caveman-mode-tracker.js`

- [ ] **Step 1: Create caveman-mode-tracker.js**

Content of `hooks/caveman-mode-tracker.js`:

```javascript
#!/usr/bin/env node
/**
 * caveman-mode-tracker.js — UserPromptSubmit hook
 *
 * Reads incoming prompt JSON from stdin. Updates ~/.claude/.caveman-active
 * flag file when /caveman commands are detected.
 *
 * CRITICAL CONSTRAINTS:
 *   - Always exits 0. Non-zero would block prompt submission.
 *   - Never writes to stdout. UserPromptSubmit stdout modifies the user's prompt.
 *   - Silent-fail on all errors.
 *
 * Credit: mode tracking pattern by Julius Brussee
 * https://github.com/JuliusBrussee/caveman
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const FLAG_FILE = path.join(os.homedir(), '.claude', '.caveman-active');

async function main() {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const input = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
    const prompt = (input?.prompt ?? '').trim().toLowerCase();

    if (prompt.startsWith('/caveman ultra')) {
      fs.writeFileSync(FLAG_FILE, 'ultra', 'utf-8');
    } else if (prompt.startsWith('/caveman lite')) {
      fs.writeFileSync(FLAG_FILE, 'lite', 'utf-8');
    } else if (prompt.startsWith('/caveman')) {
      fs.writeFileSync(FLAG_FILE, 'full', 'utf-8');
    } else if (prompt.includes('stop caveman') || prompt.includes('normal mode')) {
      try { fs.unlinkSync(FLAG_FILE); } catch { /* already gone — fine */ }
    }
  } catch {
    // Silent fail
  }
  process.exit(0); // Always 0
}

main();
```

- [ ] **Step 2: Verify tracker handles /caveman ultra**

```bash
echo '{"prompt":"/caveman ultra"}' | node hooks/caveman-mode-tracker.js
echo $?          # must be 0
cat ~/.claude/.caveman-active   # must be: ultra
```

Expected: exit code 0, flag file contains `ultra`.

- [ ] **Step 3: Verify tracker handles stop caveman**

```bash
echo '{"prompt":"stop caveman"}' | node hooks/caveman-mode-tracker.js
echo $?          # must be 0
ls ~/.claude/.caveman-active 2>&1  # must say: no such file
```

Expected: exit code 0, flag file deleted.

- [ ] **Step 4: Verify tracker produces no stdout**

```bash
output=$(echo '{"prompt":"/caveman lite"}' | node hooks/caveman-mode-tracker.js)
echo "stdout: '$output'"   # must be empty
```

Expected: `stdout: ''`

---

### Task 9: Create `hooks/install.sh`

**Files:**
- Create: `hooks/install.sh`

- [ ] **Step 1: Create install.sh**

Content of `hooks/install.sh`:

```bash
#!/usr/bin/env bash
# install.sh — Wire caveman hooks into Claude Code
# Copies hook files to ~/.claude/hooks/ and patches ~/.claude/settings.json
# Only reads/writes within ~/.claude/ — never modifies files elsewhere
#
# Credit: hook architecture by Julius Brussee
# https://github.com/JuliusBrussee/caveman

set -euo pipefail

HOOKS_DIR="$HOME/.claude/hooks"
SETTINGS="$HOME/.claude/settings.json"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Installing caveman hooks for Claude Code..."

# Create hooks dir and copy files
mkdir -p "$HOOKS_DIR"
cp "$SCRIPT_DIR/caveman-activate.js" "$HOOKS_DIR/caveman-activate.js"
cp "$SCRIPT_DIR/caveman-mode-tracker.js" "$HOOKS_DIR/caveman-mode-tracker.js"
echo "  ✓ Hook files copied to $HOOKS_DIR"

# Ensure settings.json exists
mkdir -p "$(dirname "$SETTINGS")"
[ -f "$SETTINGS" ] || echo "{}" > "$SETTINGS"

# Patch settings.json via Node (handles JSON safely)
node --input-type=module << 'NODEEOF'
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
const hooksDir    = path.join(os.homedir(), '.claude', 'hooks');
const activateCmd = `node ${path.join(hooksDir, 'caveman-activate.js')}`;
const trackerCmd  = `node ${path.join(hooksDir, 'caveman-mode-tracker.js')}`;

let settings = {};
try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8')); } catch {}

settings.hooks ??= {};
settings.hooks.SessionStart ??= [];
settings.hooks.UserPromptSubmit ??= [];

const hasCmd = (arr, cmd) =>
  arr.some(h => (h?.hooks ?? []).some(e => e?.command === cmd));

if (!hasCmd(settings.hooks.SessionStart, activateCmd)) {
  settings.hooks.SessionStart.push({ hooks: [{ type: 'command', command: activateCmd }] });
}
if (!hasCmd(settings.hooks.UserPromptSubmit, trackerCmd)) {
  settings.hooks.UserPromptSubmit.push({ hooks: [{ type: 'command', command: trackerCmd }] });
}

fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
console.log('  ✓ ~/.claude/settings.json patched');
NODEEOF

echo ""
echo "Caveman installed. Active from your next Claude Code session."
echo "Toggle: /caveman | /caveman lite | /caveman ultra | stop caveman"
```

- [ ] **Step 2: Make install.sh executable**

```bash
chmod +x hooks/install.sh
```

- [ ] **Step 3: Smoke-test install.sh (dry-run check — do not run against your live settings)**

```bash
# Check the script is valid bash before running it
bash -n hooks/install.sh && echo "Syntax OK"
```

Expected: `Syntax OK`

---

### Task 10: Create `hooks/uninstall.sh`

**Files:**
- Create: `hooks/uninstall.sh`

- [ ] **Step 1: Create uninstall.sh**

Content of `hooks/uninstall.sh`:

```bash
#!/usr/bin/env bash
# uninstall.sh — Remove caveman hooks from Claude Code
# Removes hook files from ~/.claude/hooks/, cleans settings.json, deletes flag file
# Only reads/writes within ~/.claude/ — never modifies files elsewhere

set -euo pipefail

HOOKS_DIR="$HOME/.claude/hooks"
SETTINGS="$HOME/.claude/settings.json"
FLAG_FILE="$HOME/.claude/.caveman-active"

echo "Uninstalling caveman hooks..."

# Remove hook files (no-op if missing)
rm -f "$HOOKS_DIR/caveman-activate.js"
rm -f "$HOOKS_DIR/caveman-mode-tracker.js"
echo "  ✓ Hook files removed"

# Remove flag file
rm -f "$FLAG_FILE"
echo "  ✓ Flag file removed"

# Clean settings.json
if [ -f "$SETTINGS" ]; then
  node --input-type=module << 'NODEEOF'
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
const hooksDir    = path.join(os.homedir(), '.claude', 'hooks');
const activateCmd = `node ${path.join(hooksDir, 'caveman-activate.js')}`;
const trackerCmd  = `node ${path.join(hooksDir, 'caveman-mode-tracker.js')}`;

let settings = {};
try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8')); } catch { process.exit(0); }

const removeCmd = (arr, cmd) =>
  (arr ?? [])
    .map(h => ({ ...h, hooks: (h.hooks ?? []).filter(e => e?.command !== cmd) }))
    .filter(h => h.hooks.length > 0);

if (settings.hooks) {
  settings.hooks.SessionStart    = removeCmd(settings.hooks.SessionStart,    activateCmd);
  settings.hooks.UserPromptSubmit = removeCmd(settings.hooks.UserPromptSubmit, trackerCmd);
}

fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
console.log('  ✓ ~/.claude/settings.json cleaned');
NODEEOF
fi

echo ""
echo "Caveman uninstalled."
```

- [ ] **Step 2: Make uninstall.sh executable**

```bash
chmod +x hooks/uninstall.sh
```

- [ ] **Step 3: Verify syntax**

```bash
bash -n hooks/uninstall.sh && echo "Syntax OK"
```

Expected: `Syntax OK`

---

### Task 11: Create `packages/yp-stack/src/caveman.js`

This file owns all caveman-specific npm installer logic. It exports the rule body, bundled hook file content, `installCaveman(platform, cwd)`, and `uninstallCaveman(platform, cwd)`. Kept separate from `content.js` (auto-generated) and `install.js` (yellowpages-only install logic).

**Files:**
- Create: `packages/yp-stack/src/caveman.js`

- [ ] **Step 1: Create caveman.js**

Content of `packages/yp-stack/src/caveman.js`:

```javascript
/**
 * caveman.js — Caveman terse mode installer for yp-stack
 *
 * Exports installCaveman(platform, cwd) and uninstallCaveman(platform, cwd).
 * Rule body and hook file content are bundled as string constants so this
 * module works from the npm cache without needing the repo's rules/ directory.
 *
 * Credit: Julius Brussee / https://github.com/JuliusBrussee/caveman
 * Keep RULE_BODY in sync with rules/caveman-activate.md when updating.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// ─── Bundled content ────────────────────────────────────────────────────────

export const RULE_BODY = `Respond terse like smart caveman. All technical substance stay. Only fluff die.
Drop: articles (a/an/the), filler (just/really/basically), pleasantries, hedging.
Fragments OK. Short synonyms. Technical terms exact. Code unchanged.
Pattern: [thing] [action] [reason]. [next step].
Switch level: /caveman lite|full|ultra
Stop: "stop caveman" or "normal mode"
Auto-Clarity: drop caveman for security warnings, irreversible actions, user confused. Resume after.
Boundaries: written artifacts (skills, specs, docs, reference files) NEVER caveman.
Code/commits/PRs: normal formatting.`;

// Hook file content — written to ~/.claude/hooks/ during Claude Code install
// NOTE: Keep in sync with the standalone hooks/caveman-activate.js (Task 7).
// Both must use identical logic — this is the npm-bundled version.
const HOOK_ACTIVATE = `#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const FLAG_FILE = path.join(os.homedir(), '.claude', '.caveman-active');
const RULE_BODY = \`${RULE_BODY.replace(/`/g, '\\`')}\`;
try {
  // Always reset to full on SessionStart — spec: "Resets to full on next session start"
  fs.mkdirSync(path.dirname(FLAG_FILE), { recursive: true });
  fs.writeFileSync(FLAG_FILE, 'full', 'utf-8');
  process.stdout.write(RULE_BODY + '\\n');
} catch {}
`;

const HOOK_TRACKER = `#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const FLAG_FILE = path.join(os.homedir(), '.claude', '.caveman-active');
async function main() {
  try {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    const input = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
    const prompt = (input?.prompt ?? '').trim().toLowerCase();
    if (prompt.startsWith('/caveman ultra')) fs.writeFileSync(FLAG_FILE, 'ultra', 'utf-8');
    else if (prompt.startsWith('/caveman lite')) fs.writeFileSync(FLAG_FILE, 'lite', 'utf-8');
    else if (prompt.startsWith('/caveman')) fs.writeFileSync(FLAG_FILE, 'full', 'utf-8');
    else if (prompt.includes('stop caveman') || prompt.includes('normal mode')) {
      try { fs.unlinkSync(FLAG_FILE); } catch {}
    }
  } catch {}
  process.exit(0);
}
main();
`;

// ─── Platform-to-path map ────────────────────────────────────────────────────
// Not in platforms.js (which carries only skill paths). Maintained here.

const PLATFORM_RULE_PATHS = {
  cursor:   (cwd) => path.join(cwd, '.cursor', 'rules', 'caveman.mdc'),
  windsurf: (cwd) => path.join(cwd, '.windsurf', 'rules', 'caveman.md'),
  cline:    (cwd) => path.join(cwd, '.clinerules', 'caveman.md'),
  roo:      (cwd) => path.join(cwd, '.roo', 'rules', 'caveman.md'),
  opencode: (cwd) => path.join(cwd, '.opencode', 'rules', 'caveman.md'),
  copilot:  (cwd) => path.join(cwd, '.github', 'copilot-instructions.md'),
};

const FRONTMATTER = {
  cursor:   '---\nalwaysApply: true\n---\n\n',
  windsurf: '---\ntrigger: always_on\n---\n\n',
};

const COPILOT_START = '<!-- caveman:start -->';
const COPILOT_END   = '<!-- caveman:end -->';

// ─── Install ─────────────────────────────────────────────────────────────────

export function installCaveman(platform, cwd = process.cwd()) {
  if (platform === 'claude') {
    _installClaudeCode();
    return;
  }
  if (platform === 'generic' || platform === 'custom') {
    console.log('\nCaveman always-on snippet (paste into your agent system prompt):\n');
    console.log(RULE_BODY);
    return;
  }
  if (platform === 'copilot') {
    _installCopilot(cwd);
    return;
  }
  const rulePath = PLATFORM_RULE_PATHS[platform]?.(cwd);
  if (!rulePath) return;
  const frontmatter = FRONTMATTER[platform] ?? '';
  fs.mkdirSync(path.dirname(rulePath), { recursive: true });
  fs.writeFileSync(rulePath, frontmatter + RULE_BODY + '\n', 'utf-8');
}

function _installClaudeCode() {
  const hooksDir    = path.join(os.homedir(), '.claude', 'hooks');
  const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
  const activateCmd = `node ${path.join(hooksDir, 'caveman-activate.js')}`;
  const trackerCmd  = `node ${path.join(hooksDir, 'caveman-mode-tracker.js')}`;

  fs.mkdirSync(hooksDir, { recursive: true });
  fs.writeFileSync(path.join(hooksDir, 'caveman-activate.js'),    HOOK_ACTIVATE, 'utf-8');
  fs.writeFileSync(path.join(hooksDir, 'caveman-mode-tracker.js'), HOOK_TRACKER,  'utf-8');

  let settings = {};
  try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8')); } catch {}
  settings.hooks ??= {};
  settings.hooks.SessionStart ??= [];
  settings.hooks.UserPromptSubmit ??= [];

  const hasCmd = (arr, cmd) => arr.some(h => (h?.hooks ?? []).some(e => e?.command === cmd));
  if (!hasCmd(settings.hooks.SessionStart, activateCmd))
    settings.hooks.SessionStart.push({ hooks: [{ type: 'command', command: activateCmd }] });
  if (!hasCmd(settings.hooks.UserPromptSubmit, trackerCmd))
    settings.hooks.UserPromptSubmit.push({ hooks: [{ type: 'command', command: trackerCmd }] });

  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
}

function _installCopilot(cwd) {
  const filePath = path.join(cwd, '.github', 'copilot-instructions.md');
  const block    = `\n${COPILOT_START}\n${RULE_BODY}\n${COPILOT_END}\n`;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, 'utf-8');
    if (existing.includes(COPILOT_START)) return; // already installed — idempotent
    fs.appendFileSync(filePath, block, 'utf-8');
  } else {
    fs.writeFileSync(filePath, block.trimStart(), 'utf-8');
  }
}

// ─── Uninstall ───────────────────────────────────────────────────────────────

export function uninstallCaveman(platform, cwd = process.cwd()) {
  if (platform === 'claude') {
    _uninstallClaudeCode();
    return;
  }
  if (platform === 'generic' || platform === 'custom') {
    console.log('Remove the caveman snippet from your agent system prompt manually.');
    return;
  }
  if (platform === 'copilot') {
    _uninstallCopilot(cwd);
    return;
  }
  const rulePath = PLATFORM_RULE_PATHS[platform]?.(cwd);
  if (rulePath) try { fs.unlinkSync(rulePath); } catch { /* already gone */ }
}

function _uninstallClaudeCode() {
  const hooksDir    = path.join(os.homedir(), '.claude', 'hooks');
  const settingsPath = path.join(os.homedir(), '.claude', 'settings.json');
  const flagFile    = path.join(os.homedir(), '.claude', '.caveman-active');
  const activateCmd = `node ${path.join(hooksDir, 'caveman-activate.js')}`;
  const trackerCmd  = `node ${path.join(hooksDir, 'caveman-mode-tracker.js')}`;

  try { fs.unlinkSync(path.join(hooksDir, 'caveman-activate.js'));    } catch {}
  try { fs.unlinkSync(path.join(hooksDir, 'caveman-mode-tracker.js')); } catch {}
  try { fs.unlinkSync(flagFile); } catch {}

  let settings = {};
  try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8')); } catch { return; }

  const removeCmd = (arr, cmd) =>
    (arr ?? [])
      .map(h => ({ ...h, hooks: (h.hooks ?? []).filter(e => e?.command !== cmd) }))
      .filter(h => h.hooks.length > 0);

  if (settings.hooks) {
    settings.hooks.SessionStart    = removeCmd(settings.hooks.SessionStart,    activateCmd);
    settings.hooks.UserPromptSubmit = removeCmd(settings.hooks.UserPromptSubmit, trackerCmd);
  }
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
}

function _uninstallCopilot(cwd) {
  const filePath = path.join(cwd, '.github', 'copilot-instructions.md');
  if (!fs.existsSync(filePath)) return; // no-op if file absent
  let content = fs.readFileSync(filePath, 'utf-8');
  const start = content.indexOf(COPILOT_START);
  const end   = content.indexOf(COPILOT_END);
  if (start === -1 || end === -1) return;
  content = content.slice(0, start).trimEnd() + content.slice(end + COPILOT_END.length);
  fs.writeFileSync(filePath, content.trimStart() || '', 'utf-8');
}
```

- [ ] **Step 2: Verify the module parses (no syntax errors)**

```bash
cd packages/yp-stack
node --input-type=module <<'EOF'
import { RULE_BODY, installCaveman, uninstallCaveman } from './src/caveman.js';
console.log('RULE_BODY lines:', RULE_BODY.split('\n').length);
console.log('installCaveman:', typeof installCaveman);
console.log('uninstallCaveman:', typeof uninstallCaveman);
EOF
```

Expected:
```
RULE_BODY lines: 9
installCaveman: function
uninstallCaveman: function
```

---

### Task 12: Add caveman prompt to `packages/yp-stack/src/index.js`

**Files:**
- Modify: `packages/yp-stack/src/index.js`

- [ ] **Step 1: Add import at top of index.js**

In `packages/yp-stack/src/index.js`, add to the existing import block (after the current imports):

```javascript
import { installCaveman } from './caveman.js';
```

- [ ] **Step 2: Add caveman prompt after the spinner.stop line**

Find this line in `index.js` (currently around line 305):

```javascript
    spinner.stop('Installation complete');
```

Immediately after it (before the results display block), add:

```javascript
    // ── Caveman terse mode ──
    console.log();
    const installCavemanMode = await p.confirm({
      message: 'Install caveman terse mode? Cuts ~65% output tokens. ON by default, toggle with /caveman.',
      initialValue: true,
    });
    if (!p.isCancel(installCavemanMode) && installCavemanMode) {
      try {
        installCaveman(platform, rootDir);
        result.created.push('caveman terse mode');
      } catch {
        p.log.warn('Caveman install failed — install manually with: bash hooks/install.sh');
      }
    }
```

- [ ] **Step 3: Verify index.js still parses**

```bash
cd packages/yp-stack
node --input-type=module --eval "import('./src/index.js').then(() => console.log('OK'))"
```

Expected: `OK`

---

### Task 13: Add `--uninstall caveman` to `packages/yp-stack/bin/cli.js`

**Files:**
- Modify: `packages/yp-stack/bin/cli.js`

- [ ] **Step 1: Update cli.js**

Replace the current content of `packages/yp-stack/bin/cli.js`:

```javascript
#!/usr/bin/env node
import { main } from '../src/index.js';

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

With:

```javascript
#!/usr/bin/env node
import path from 'node:path';
import fs from 'node:fs';
import { main } from '../src/index.js';
import { uninstallCaveman } from '../src/caveman.js';
import { detectPlatforms } from '../src/platforms.js';

// ── --uninstall caveman ──────────────────────────────────────────────────────
if (process.argv.includes('--uninstall') && process.argv.includes('caveman')) {
  const cwd = process.cwd();

  // Read platform from yellowpages.config.json if available
  let platform = null;
  try {
    const config = JSON.parse(fs.readFileSync(path.join(cwd, 'yellowpages.config.json'), 'utf-8'));
    if (config.platform) platform = config.platform;
  } catch {}

  // Fall back to auto-detection
  if (!platform) {
    const detected = detectPlatforms(cwd);
    platform = detected[0] ?? 'generic';
  }

  try {
    uninstallCaveman(platform, cwd);
    console.log(`Caveman uninstalled (platform: ${platform}).`);
  } catch (err) {
    console.error('Caveman uninstall failed:', err.message);
    process.exit(1);
  }
  process.exit(0);
}

// ── Normal install flow ──────────────────────────────────────────────────────
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Verify cli.js parses**

```bash
node --check packages/yp-stack/bin/cli.js && echo "Syntax OK"
```

Expected: `Syntax OK`

- [ ] **Step 3: Smoke-test --uninstall caveman flag is reachable**

```bash
cd packages/yp-stack
node bin/cli.js --uninstall caveman 2>&1 | head -3
```

Expected: output mentions "Caveman uninstalled" or "Caveman uninstall failed" (not a crash or "command not found").

---

### Task 14: Final verification and commit

- [ ] **Step 1: Verify all new files exist**

```bash
ls rules/caveman-activate.md
ls hooks/caveman-activate.js hooks/caveman-mode-tracker.js hooks/install.sh hooks/uninstall.sh
ls .agents/skills/yellowpages/caveman/SKILL.md
ls .agents/skills/yellowpages/caveman/references/behavior.md
ls .agents/skills/yellowpages/caveman/references/toggle.md
ls .agents/skills/yellowpages/caveman/references/credit.md
ls skills/yellowpages/caveman/SKILL.md
ls packages/yp-stack/src/caveman.js
```

Expected: all files present, no errors.

- [ ] **Step 2: Verify INDEX.md is exactly 30 lines**

```bash
wc -l .agents/skills/yellowpages/INDEX.md
```

Expected: `30`

- [ ] **Step 3: Verify SKILL.md is ≤80 lines**

```bash
wc -l .agents/skills/yellowpages/caveman/SKILL.md
```

Expected: ≤ 80

- [ ] **Step 4: Verify hook stdout (rule body emitted correctly)**

```bash
node hooks/caveman-activate.js | wc -l
```

Expected: `9`

- [ ] **Step 5: Verify mode tracker exits 0 and produces no stdout**

```bash
# Capture stdout separately from exit code — semicolon would reset $?
stdout=$(echo '{"prompt":"/caveman lite"}' | node hooks/caveman-mode-tracker.js)
echo "exit: $?  stdout: '$stdout'"
```

Expected: `exit: 0  stdout: ''`

Note: `$?` after a command substitution `$(...)` captures the exit code of the command inside the substitution. The `echo` before the pipe exits 0 but is not captured by `$?` here.

- [ ] **Step 6: Commit Chunk 2**

```bash
git add hooks/ packages/yp-stack/src/caveman.js \
        packages/yp-stack/src/index.js packages/yp-stack/bin/cli.js
git commit -m "feat: add caveman hooks and npm installer

SessionStart hook + UserPromptSubmit tracker for Claude Code.
Standalone install.sh/uninstall.sh for repo-clone developers.
installCaveman/uninstallCaveman in yp-stack for all 8 agent platforms.
--uninstall caveman flag in bin/cli.js."
```

---

## Done

Both commits land on `main`. Caveman is active from the next Claude Code session for anyone who has run `bash hooks/install.sh` or `npx yp-stack`.

**Manual smoke test after install:**
1. Run `bash hooks/install.sh`
2. Start a new Claude Code session in this repo
3. Ask "what does the caveman skill do?" — response should be terse, no pleasantries
4. Say `/caveman lite` — response should soften slightly
5. Say "stop caveman" — response should return to normal prose
6. Start another new session — caveman should be back on (full mode)
