# gstack Source Notes — Verified from Repo

**Date:** 2026-04-19
**Status:** Research (not spec)
**Source:** `git clone --depth 1 https://github.com/garrytan/gstack` at commit `main` (read at `/tmp/gstack-reference/`)
**Purpose:** Replace secondhand WebFetch-derived claims with verified facts from actual source, so the upcoming setup-adoption spec builds on ground truth.

---

## Scope

Verified five files directly:

| File | Lines | Purpose |
|---|---|---|
| `bin/gstack-config` | 168 | Config reader/writer |
| `bin/gstack-team-init` | 192 | Project-level enforcement kit |
| `bin/gstack-update-check` | 211 | Throttled version check |
| `bin/gstack-uninstall` | 259 | Teardown |
| `setup` (partial) | 1011 | Install orchestrator |
| `hosts/claude.ts` + `hosts/index.ts` + `docs/ADDING_A_HOST.md` | — | Per-host abstraction |

---

## 1. Config File — `~/.gstack/config.yaml`

**Verified:**
- Global-only — no project-level config exists. Repo-local state lives separately in `.gstack/` (browse daemon state), not as config.
- Managed via `bin/gstack-config {get|set|list|defaults} <key> [value]`.
- Path: `${GSTACK_STATE_DIR:-$HOME/.gstack}/config.yaml`. Env override supported for tests.
- Format: plain `key: value` lines, one per line. Parsed with `grep -E "^${KEY}:" | tail -1 | awk '{print $2}' | tr -d '[:space:]'` — not a real YAML parser.
- Key validation: `^[a-zA-Z0-9_]+$` enforced on both `get` and `set`.
- First `set` call writes a large annotated header (lines 20–67) documenting every key. Header is documentation only; the `lookup_default` function (lines 72–88) is the canonical defaults source.
- Value whitelisting: for closed-domain keys like `explain_level`, unknown values emit a warning and coerce to default. See line 113.
- Edit pattern: portable in-place — writes to `${CONFIG_FILE}.XXXXXX` via `mktemp`, then `mv`. Avoids BSD-vs-GNU `sed -i` incompatibility.
- Post-set hook: if key is `skill_prefix`, runs `bin/gstack-relink` automatically (unless `GSTACK_SETUP_RUNNING=1` is set to prevent recursion during setup).

**Verified default keys:**

```
proactive              true
routing_declined       false
telemetry              off
auto_upgrade           false
update_check           true
skill_prefix           false
checkpoint_mode        explicit
checkpoint_push        false
codex_reviews          enabled
gstack_contributor     false
skip_eng_review        false
cross_project_learnings ""   # empty → triggers first-time prompt
```

**Correction to earlier summary:** the `explain_level` key exists in the header documentation (line 55) but is **not in `lookup_default`**. So it has no hardcoded default — `get explain_level` returns empty string unless set. The header says "default" but the code doesn't enforce it.

---

## 2. Team Init — `bin/gstack-team-init {optional|required}`

**Verified behavior:**

1. **Must run inside git repo** — errors if `git rev-parse --show-toplevel` fails.
2. **Migrates vendored copy first** (lines 34–50):
   - Detects `.claude/skills/gstack/` dir (not symlink) containing `VERSION` or `.git`.
   - Runs `git rm -r --cached .claude/skills/gstack/`.
   - Appends `.claude/skills/gstack/` to `.gitignore` (creates file if missing, dedupes).
   - `rm -rf`'s the vendored dir.
3. **CLAUDE.md snippet injection**:
   - Checks for existing `## gstack` section; skips if found.
   - `optional` snippet = recommendation with install command (lines 55–66).
   - `required` snippet = mandatory verification block with `GSTACK_OK`/`GSTACK_MISSING` test command + "STOP. Do not proceed." language (lines 68–90).
4. **`required` mode only — enforcement hook**:
   - Writes `.claude/hooks/check-gstack.sh` (heredoc from lines 114–136).
   - Hook behavior: tests `[ -d "$HOME/.claude/skills/gstack/bin" ]`. If missing, emits `{"permissionDecision":"deny","message":"..."}` to stdout and install instructions to stderr. Exits 0 either way.
   - `chmod +x` on the hook script.
5. **`required` mode settings.json patch**:
   - Requires `bun` in PATH. No fallback — warns if missing.
   - Uses inline `bun -e` script (lines 142–171) to JSON-patch `.claude/settings.json`.
   - Adds to `hooks.PreToolUse` array with `matcher: "Skill"` and command `"$CLAUDE_PROJECT_DIR/.claude/hooks/check-gstack.sh"`.
   - Dedups by scanning existing entries for `matcher === 'Skill'` AND any hook with command containing `check-gstack`.
   - Atomic write: `fs.writeFileSync(tmp)` then `fs.renameSync(tmp, settingsPath)`.
6. **Output tells user to commit**: echoes `git add` + `git commit -m "chore: require gstack for AI-assisted work"` and the teammate install steps.

**Correction to earlier summary:** `check-gstack.sh` checks for `~/.claude/skills/gstack/bin` specifically — a subdirectory, not the skill root. Presence of `bin/` is the install marker. This is load-bearing for yellowpages adoption — we'd check a different marker (e.g. `~/.claude/skills/yellowpages/.yp-version`).

**Correction:** the hook blocks only the `Skill` tool (PreToolUse matcher). It does not block other tools. Devs can still code; they just can't invoke skills without global install.

---

## 3. Update Check — `bin/gstack-update-check`

**Verified flow:**

1. **Disabled gate** (line 30): `bin/gstack-config get update_check` — if `false`, `exit 0` silently.
2. **One-time migration heal** (lines 41–51): deletes oversized Codex `SKILL.md` files. Ignore for yellowpages adoption.
3. **Just-upgraded marker** (lines 111–121): reads `~/.gstack/just-upgraded-from`, deletes it + snooze file, echoes `JUST_UPGRADED <old> <new>`. Falls through (does not exit) in case further updates exist.
4. **Cache freshness** (lines 123–156): reads `~/.gstack/last-update-check`. TTL depends on state:
   - `UP_TO_DATE` → 60 min TTL.
   - `UPGRADE_AVAILABLE` → 720 min (12h) TTL. Longer so nag doesn't spam.
   - Corrupt → 0 (force re-fetch).
   - Cache format: single line like `UP_TO_DATE 1.2.3` or `UPGRADE_AVAILABLE 1.2.3 1.2.4`.
   - Freshness check: `find $CACHE_FILE -mmin +$TTL` — if nothing returned, cache is fresh.
5. **Snooze** (lines 60–100): `~/.gstack/update-snoozed` format = `<version> <level> <epoch>`. Level 1 = 24h, 2 = 48h, 3+ = 7d. New remote version (mismatch) invalidates snooze. Corrupt/non-integer values treat as unsnoozed.
6. **Remote fetch** (lines 158–199): `curl -sf --max-time 5 https://raw.githubusercontent.com/garrytan/gstack/main/VERSION`. Validates result matches `^[0-9]+\.[0-9.]+$` — rejects HTML error pages. On invalid: caches `UP_TO_DATE` defensively.
7. **Telemetry ping** (lines 164–179): if Supabase config present AND telemetry ≠ `off`, fires background `curl` to Supabase edge function. Backgrounded with `&` — non-blocking.
8. **Output shape** — always one line or nothing. Caller is a SessionStart hook that echoes this line to agent context.

**Correction to earlier summary:** cache TTL for UPGRADE_AVAILABLE is **720 min not 60 min**. The 60/720 split is intentional: fast detection when new release drops, slower re-nag once user knows.

---

## 4. Setup Script — `./setup`

**Verified flags:**

```
--host <claude|codex|kiro|factory|opencode|openclaw|hermes|gbrain|auto>
--host=<value>              # equals-form accepted
--local                     # DEPRECATED, warns
--prefix / --no-prefix      # toggles "gstack-" skill namespace, persists to config
--team / --no-team          # opts in/out of team mode (tracked as TEAM_MODE var)
-q | --quiet
```

**Verified host handling:**
- `claude|codex|kiro|factory|opencode|auto` → continue normal install.
- `openclaw|hermes|gbrain` → print guidance block, `exit 0`. These are "hybrid" hosts handled differently (spawn Claude sessions natively or generate artifacts only).
- `auto` → `command -v` probes: `claude`, `codex`, `kiro-cli`, `droid`, `opencode`. Installs for all present. Falls back to Claude if none detected.

**Verified prefix resolution** (lines 98–136):
1. CLI flag (highest priority).
2. Saved config `skill_prefix` from `bin/gstack-config get`.
3. Interactive prompt with 10s timeout via `read -t 10` — defaults to `0` (flat names, no prefix).
4. Non-TTY or quiet mode → `0`.
5. Choice is always persisted via `gstack-config set skill_prefix`.

**Verified setup steps (lines 223–322):**
1. Build `browse` binary via `bun run build` if stale (mtime check against sources, package.json, bun.lock).
2. macOS Apple Silicon ad-hoc codesign workaround for Bun `--compile` output (lines 253–262). Two-step `codesign --remove-signature` then `codesign -s -` to work around corrupt signatures.
3. macOS: optional `brew install coreutils` for `gtimeout`. Skippable via `GSTACK_SKIP_COREUTILS=1`.
4. Playwright Chromium install (lines 324–351).
5. Per-host skill doc generation: `bun run gen:skill-docs --host <name>` — re-runs unconditionally (mtime checks deemed "fragile").
6. `mkdir -p ~/.gstack/projects` — ensure global state dir.
7. Link skills into host-specific dirs (many lines, only partially read).

**Correction:** `--local` is explicitly deprecated and prints a warning. gstack's author is nudging everyone to global install + `--team` even for solo use.

**Correction:** `--team` flag alone does **not** generate team files. User must run `bin/gstack-team-init {optional|required}` as a separate step after setup. `--team` only records the mode preference.

---

## 5. Per-Host Abstraction — `hosts/*.ts`

**Verified pattern:**
- 10 host configs: claude, codex, factory, kiro, opencode, slate, cursor, openclaw, hermes, gbrain.
- Each is a TypeScript module exporting a `HostConfig` object (from `scripts/host-config`).
- Registry at `hosts/index.ts` — imports all, exports `ALL_HOST_CONFIGS`, `HOST_CONFIG_MAP`, `ALL_HOST_NAMES`, `getHostConfig(name)`, `resolveHostArg(arg)`, `getExternalHosts()`.
- Type `Host` is derived via `(typeof ALL_HOST_CONFIGS)[number]['name']` — compile-time union from the array.

**Verified HostConfig shape** (from `claude.ts` + `ADDING_A_HOST.md`):

```typescript
{
  name: string,                  // canonical ID
  displayName: string,
  cliCommand: string,            // for `command -v` detection
  cliAliases: string[],          // alternative binary names

  globalRoot: string,            // e.g. ".claude/skills/gstack"
  localSkillRoot: string,
  hostSubdir: string,            // e.g. ".claude"
  usesEnvVars: boolean,          // false for Claude (literal ~)

  frontmatter: {
    mode: 'allowlist' | 'denylist',
    keepFields?: string[],       // if allowlist
    stripFields?: string[],      // if denylist
    descriptionLimit: number|null, // e.g. 1024 for Codex
  },

  generation: {
    generateMetadata: boolean,
    skipSkills: string[],
  },

  pathRewrites: { from: string, to: string }[],
  toolRewrites: Record<string, string>,
  suppressedResolvers: string[],

  runtimeRoot: {
    globalSymlinks: string[],
    globalFiles: Record<string, string[]>,
  },

  install: {
    prefixable: boolean,
    linkingStrategy: 'real-dir-symlink' | 'symlink-generated',
  },

  coAuthorTrailer?: string,
  learningsMode: 'full' | 'basic',
}
```

**Key insight for yellowpages adoption:** every downstream system (generator, setup bash, uninstall bash, platform-detect, health checks, tests) reads from these configs. Zero per-host code exists outside `hosts/`. Adding a host is one TypeScript file + one line in the registry.

**Correction:** I previously described `hosts/` as JSON-like config. It is **TypeScript** with real typed interfaces. The type derivation pattern (`Host = ALL_HOST_CONFIGS[number]['name']`) is the magic — lets the generator switch on host name with exhaustive compile-time checks.

---

## 6. Uninstall — `bin/gstack-uninstall`

**Verified flags:**

```
--force         # skip confirmation
--keep-state    # remove skills but preserve ~/.gstack/
-h | --help     # extracts header comments via sed, prints
```

**Verified removal targets:**
- `~/.claude/skills/gstack` + per-skill symlinks
- `~/.codex/skills/gstack*`
- `~/.factory/skills/gstack*`
- `~/.kiro/skills/gstack*`
- `~/.gstack/` (unless `--keep-state`)
- Project-local `.claude/skills/gstack*` (for deprecated `--local` installs)
- `.gstack/` and `.gstack-worktrees/` (browse state per-project)
- `.agents/skills/gstack*` (Codex/Gemini/Cursor sidecar)
- Running browse daemons (SIGTERM → 2s grace → SIGKILL)

**Verified preserved:**
- `~/Library/Caches/ms-playwright/` (shared with other tools)
- `~/.gstack-dev/` (contributor-only eval artifacts)

**Safety pattern:** uses `set -uo pipefail` (no `-e`) so partial failures don't abort cleanup. Browse daemon PIDs come from `awk`-parsing JSON state files (no jq dependency).

---

## Implications for Yellowpages Adoption Spec

### Directly steal

1. **Global-only config file at `~/.yellowpages/config.yaml`** with shell-parseable `key: value` format, managed by a small `bin/yp-config` (or `yp config` subcommand in Node). The grep/awk parser is legitimately robust and dependency-free.
2. **Annotated header on first `set`** — documentation lives in the config file itself. New users who `cat ~/.yellowpages/config.yaml` see every option explained.
3. **`lookup_default` table pattern** — single source of truth for defaults, separate from header docs. Keep them in sync manually (or generate one from the other).
4. **`yp-team-init {optional|required}` command** as a separate script from the main installer. Single responsibility.
5. **PreToolUse:Skill hook** as `required` mode's teeth. Write hook script + `bun -e` settings.json patch (we already have bun in yp-stack).
6. **`.gitignore` automation** when migrating existing vendored installs.
7. **Cache + snooze update check** at `~/.yellowpages/last-update-check` + `~/.yellowpages/update-snoozed`. Wire into `hooks/skills-manifest.js` — one line of output, non-blocking.
8. **60/720 TTL split** — fast UP_TO_DATE refresh, slow UPGRADE_AVAILABLE re-nag.
9. **Atomic settings.json writes** via `mktemp` → `rename` (both in bash and Node). Our `install.js` currently writes directly — should switch.
10. **`host: auto` flag** with `command -v` detection. Our `detectPlatforms()` already does filesystem-based detection; add CLI-binary detection as second signal.

### Adapt, don't copy

1. **`hosts/*.ts` abstraction** — overkill for v0.5.0 yellowpages since we currently serve identical content across platforms. Worth planning for but not needed for Phase 1. Revisit when platforms diverge meaningfully.
2. **Full TypeScript typing** — yp-stack is plain JS. Adding TS just for host configs trades simplicity for type safety. Could use a JSON schema + JSDoc instead.
3. **`--prefix` toggle** — gstack solves namespace collisions with other skill packs. Yellowpages already namespaces via `/yp:` prefix (hardcoded). Only add toggle if users report collisions in practice.
4. **Supabase telemetry ping** — out of scope for yellowpages. Skip entirely.
5. **Browse binary build step** — gstack-specific (Playwright + Bun compile). Irrelevant.

### Explicitly reject

1. **Git clone as install mechanism** — yellowpages uses `npx yp-stack` bundled content. Keeping that. Users shouldn't need git to install.
2. **Bash-only setup script** — our installer is Clack-based Node. That stays; it's better UX than gstack's bash prompts.
3. **`GSTACK_CONTRIBUTOR` telemetry trailer** — project-philosophy-specific. Skip.

---

## Correction Ledger (vs earlier summary)

| Claim in earlier summary | Reality | Source |
|---|---|---|
| `check-gstack.sh` tests install root | Tests `bin/` subdirectory specifically | `gstack-team-init:118` |
| UPGRADE_AVAILABLE cache TTL = 60min | Actually 720min (12h). Only UP_TO_DATE is 60min. | `gstack-update-check:128–130` |
| `--team` generates team files | `--team` only records preference. `gstack-team-init` generates files separately. | `setup:51`, `gstack-team-init:14` |
| `hosts/*.ts` is JSON-like config | Real TypeScript with derived union type. | `hosts/index.ts:28–29` |
| `explain_level` has default "default" | Documented but not in `lookup_default` — returns empty string. | `gstack-config:72–88` |
| Global install = git clone to `~/.claude/skills/gstack` | Correct, but `--local` deprecated warns and nudges to global + team. Vendored installs get migrated out automatically. | `setup:139–150`, `gstack-team-init:34–50` |
| Config set via simple line append | First `set` writes multi-line annotated header. Subsequent `set` does in-place sed with mktemp/rename portability. | `gstack-config:117–129` |
| gstack uses literal YAML parser | Uses grep+awk (not jq, not yq, not real YAML). Key validation enforces alphanumeric+underscore. | `gstack-config:98, 94` |

---

## Next Step

Spec draft can now proceed with verified facts. Recommended structure for `docs/specs/2026-04-19-gstack-setup-adoption.md`:

1. **Phase 1 — Config file + `yp config` command** (smallest diff, highest ROI).
2. **Phase 2 — `npx yp-stack --team` + `yp-team-init` flow** with PreToolUse hook enforcement.
3. **Phase 3 — Throttled update check in skills-manifest.js**.
4. **Phase 4 — Host config abstraction** (deferred; revisit when platforms diverge).

File citations in the spec should reference `/tmp/gstack-reference/` line numbers as verified above, not the earlier WebFetch summary.

---

## Files Read

- `/tmp/gstack-reference/bin/gstack-config` (full, 168 lines)
- `/tmp/gstack-reference/bin/gstack-team-init` (full, 192 lines)
- `/tmp/gstack-reference/bin/gstack-update-check` (full, 211 lines)
- `/tmp/gstack-reference/bin/gstack-uninstall` (lines 1–120)
- `/tmp/gstack-reference/setup` (lines 1–480 of 1011)
- `/tmp/gstack-reference/hosts/claude.ts` (full, 46 lines)
- `/tmp/gstack-reference/hosts/index.ts` (full, 69 lines)
- `/tmp/gstack-reference/docs/ADDING_A_HOST.md` (lines 1–100)

Not yet read (deferred until needed for Phase 4 spec):
- `/tmp/gstack-reference/setup` lines 480–1011
- `/tmp/gstack-reference/scripts/host-config.ts` (HostConfig type definition)
- `/tmp/gstack-reference/scripts/gen:skill-docs` generator
- Remaining host configs (`codex.ts`, `factory.ts`, etc.)
