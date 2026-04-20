# gstack Setup Adoption — Design Spec

**Date:** 2026-04-19
**Status:** Draft
**Credit:** Config file pattern, team-init enforcement hook, throttled update check, and host auto-detection are derived from [garrytan/gstack](https://github.com/garrytan/gstack). This spec describes adapting those patterns to yellowpages' Node/Clack-based installer.
**Research basis:** `docs/research/2026-04-19-gstack-source-notes.md` — verified line-level citations from gstack source at `/tmp/gstack-reference/`.

---

## Problem

Today a developer adopting yellowpages across several projects is forced through the same 6–7 Clack prompts every time, even when their preferences never change. Worse, every project install vendors a full copy of `.claude/skills/yellowpages/` into the repo — producing diff noise, version drift across teammates, and bloated commits. Teammates cannot silently inherit a working setup; each must re-run `npx yp-stack`. There is no throttled update check, no single place to see or edit defaults, and no enforcement mechanism ensuring every teammate has a compatible install before they start working with skills.

## Goal

Make yellowpages behave like a single, canonical global library that any project can opt into via a tiny, committable enforcement kit — and let every interactive prompt be satisfied from a global config so installs in new repos complete in seconds without questions.

## Non-Goals

- Replacing the Clack-based installer UX on first run (it stays for discoverability)
- Migrating existing project-vendored installs automatically without user opt-in
- Implementing a per-host TypeScript config system (deferred to Phase 4, not in scope here)
- Telemetry, Supabase integration, or analytics pings
- Git-clone-based install as a replacement for `npx yp-stack`
- Changing the shape or content of any skill file under `skills/yellowpages/`

---

## Chosen Approach

Three sequenced phases, each independently shippable:

1. **Phase 1 — Global config file** at `~/.yellowpages/config.yaml` managed by a small `yp config` subcommand. First-run installer writes the config. Subsequent runs short-circuit any prompt whose answer already lives in config.
2. **Phase 2 — Team mode** via `npx yp-stack --team {optional|required}`. Writes a small enforcement kit into the project repo (`CLAUDE.md` section, `.claude/hooks/check-yp.sh`, `.claude/settings.json` PreToolUse hook, `.gitignore` entry) instead of vendoring skills. Teammates pull commits, run `npx yp-stack` once globally, and the hook is satisfied.
3. **Phase 3 — Throttled update check** integrated into the existing `hooks/skills-manifest.js` SessionStart hook. One-line output on upgrade available, cached with 60/720-minute TTL split and level-based snooze.
4. **Phase 4 — Host config abstraction** in `packages/yp-stack/src/hosts/*.js` with a registry at `hosts/index.js`. Migrated the inline `PLATFORMS` array into per-host modules, added a JSDoc-typed `HostConfig` contract + registry validator, and generalized the Claude-only slash-commands path via `hasCommandsSupport` + `commandsSubdir`. `src/platforms.js` remains as a back-compat shim so existing call sites keep working.

---

## Architecture

### Phase 1 — Global Config File

**Location:** `${YP_STATE_DIR:-$HOME/.yellowpages}/config.yaml`

**Format:** plain `key: value` lines, one per line. Parseable without a YAML library — `grep -E "^${key}:" | tail -1 | awk '{print $2}' | tr -d '[:space:]'`. Key regex `^[a-zA-Z0-9_]+$` enforced on read and write. First `set` writes an annotated header documenting every key.

**Source of defaults:** a single `DEFAULTS` table inside `packages/yp-stack/src/config.js`. The header text is documentation; the defaults table is the canonical truth. They must stay in sync (linted by a test).

**Initial key set:**

| Key | Default | Meaning |
|---|---|---|
| `platform` | `""` | Target platform (`claude`, `cursor`, `windsurf`, `copilot`, `cline`, `roo`, `opencode`, `generic`). Empty → auto-detect. |
| `scope` | `full` | Install scope (`full` \| `skill` \| `minimal`). |
| `caveman` | `full` | Caveman intensity (`off` \| `lite` \| `full` \| `ultra`). |
| `state_tracking` | `true` | Cross-session learnings + gates. |
| `auto_upgrade` | `false` | Silently upgrade on session start. |
| `update_check` | `true` | Surface upgrade-available messages. |
| `default_host` | `auto` | On install, detect binaries if `auto`. |
| `default_install_location` | `global` | `global` \| `project`. |
| `team_mode` | `""` | `""` \| `optional` \| `required`. Empty means not a team install. |

**CLI surface:** `yp config {get|set|list|defaults|edit} [key] [value]`

- `get <key>` → prints value from config file, falling back to DEFAULTS. Exits 1 if key invalid.
- `set <key> <value>` → validates key + value (closed-domain values whitelisted), writes header if file absent, otherwise in-place `sed` with `mktemp`/`rename` for BSD/GNU portability.
- `list` → prints file contents followed by active-values block with `(set|default)` source markers.
- `defaults` → prints the DEFAULTS table only.
- `edit` → opens `$EDITOR ~/.yellowpages/config.yaml`.

**Installer integration (`packages/yp-stack/src/index.js`):**

On entry, read `~/.yellowpages/config.yaml` if present. For each existing prompt in `index.js`, skip the prompt when the corresponding config key is set. Surface the resolved value in the summary block so the user still sees what will happen. Add a `--reconfigure` flag that ignores config and forces all prompts.

New command: `npx yp-stack config <subcommand>` — wraps the `yp config` subcommand.

### Phase 2 — Team Mode

**Entry point:** `npx yp-stack --team {optional|required}`

The `--team` flag changes what gets written into the project repo. The global install is unchanged — it still runs to `~/.claude/skills/yellowpages/` or wherever the platform dictates. The project-local changes are minimal and committable.

**Project files written (both modes):**

1. **`CLAUDE.md`** — appended section wrapped in `<!-- yellowpages:start -->` / `<!-- yellowpages:end -->` markers (dedup on re-run).
   - `optional` mode: gentle recommendation with install command.
   - `required` mode: mandatory verification block including test command and "STOP. Do not proceed" language.
2. **`.gitignore`** — adds `.claude/skills/yellowpages/` (and platform variants when applicable). Creates file if missing, dedupes entry.
3. **Vendored-install migration** — if `.claude/skills/yellowpages/` exists in the repo as a real directory (not symlink), run `git rm -r --cached`, append to `.gitignore`, `rm -rf`. Output tells user to commit.

**Project files written (required mode only):**

4. **`.claude/hooks/check-yp.sh`** — Bash script. Tests `[ -f "$HOME/.claude/skills/yellowpages/.yp-version" ]`. If missing: emits `{"permissionDecision":"deny","message":"yellowpages is required but not installed."}` to stdout, install instructions to stderr, exits 0. If present: emits `{}` and exits 0. `chmod +x`.
5. **`.claude/settings.json`** — patched via inline Node script (already a runtime dependency). Adds to `hooks.PreToolUse` array:
   ```json
   {
     "matcher": "Skill",
     "hooks": [{
       "type": "command",
       "command": "\"$CLAUDE_PROJECT_DIR/.claude/hooks/check-yp.sh\""
     }]
   }
   ```
   Dedups by scanning existing entries for `matcher === 'Skill'` with a hook command containing `check-yp`. Atomic write via `fs.writeFileSync(tmp)` + `fs.renameSync(tmp, settingsPath)`.

**Install marker:** Phase 2 requires every global install to write `${skillPath}/yellowpages/.yp-version` so the hook has a reliable existence check. This file already exists in `install.js:297–299` — no change needed.

**Git preconditions:** `--team` mode errors if not inside a git repo (`git rev-parse --show-toplevel` fails). Matches gstack behavior.

**Post-install output:** prints the `git add` + `git commit -m "chore: adopt yellowpages ..."` commands the user should run, plus the teammate install command (`npx yp-stack`).

### Phase 3 — Throttled Update Check

**Wiring:** add a check routine to `hooks/skills-manifest.js`. The hook already runs at SessionStart — adding ~60 lines of logic here avoids a second hook registration.

**State files:**

- `~/.yellowpages/last-update-check` — one-line cache (`UP_TO_DATE 0.5.0` or `UPGRADE_AVAILABLE 0.5.0 0.5.1`).
- `~/.yellowpages/update-snoozed` — `<version> <level> <epoch>` format.
- `~/.yellowpages/just-upgraded-from` — written by `yp upgrade` when it completes. Read + deleted by update check to emit `JUST_UPGRADED` line once.

**TTL policy:**

- `UP_TO_DATE` → 60 minutes. Fast detection when a new release drops.
- `UPGRADE_AVAILABLE` → 720 minutes (12 hours). Avoid nag spam once user is aware.
- Corrupt cache → 0 (force re-fetch).

**Snooze levels (reset when remote version changes):**

- Level 1: 24 hours
- Level 2: 48 hours
- Level 3+: 7 days

**Remote endpoint:** `https://raw.githubusercontent.com/nilsclabb/yellowpages/main/packages/yp-stack/package.json`. Parse `version` field. Validate against `^\d+\.\d+\.\d+$` to reject HTML error pages. `curl -sf --max-time 5`.

**Output shape:** one line appended to the manifest output block, or nothing. Examples:

```
[YP_UPGRADE_AVAILABLE 0.5.0 0.5.1 · snooze: yp snooze]
[YP_JUST_UPGRADED 0.4.8 → 0.5.0]
```

**Disable gate:** `yp config get update_check` — if `false`, skip entirely. Silent-fail on network errors so hooks never block session start.

**New command:** `yp snooze [level]` — bumps snooze level (default 1). `yp snooze reset` clears the file.

### Phase 4 — Host Config Abstraction

Shipped alongside Phases 1–3 in `yp-stack 0.5.x`.

Migrated the inline `PLATFORMS` array in `packages/yp-stack/src/platforms.js` into per-host JSDoc-typed modules at `packages/yp-stack/src/hosts/<name>.js`, registered via `packages/yp-stack/src/hosts/index.js`. Each module exports a `HostConfig` object and the registry module exposes `ALL_HOSTS`, `HOST_MAP`, `HOST_NAMES`, `getHost(name)`, and `detectHosts(cwd)`. A JSDoc `@typedef` + `validateAllHostConfigs()` give us the runtime safety equivalent to gstack's TypeScript derived-union pattern without adding a build step.

`src/platforms.js` becomes a thin back-compat shim so existing call sites (`index.js`, `skills-manager.js`, `bin/cli.js`, `test/install.test.js`) keep working. New fields `hasCommandsSupport` + `commandsSubdir` let hosts opt into the slash-command wrapper surface declaratively — the previous `platform === "claude"` check in `index.js` is gone.

Follow-up (not in scope): move remaining call sites off the shim; add per-host frontmatter/rewrite hooks only when a second host actually ships differing content.

---

## File Inventory

### New files

```
packages/yp-stack/src/config.js
  Config reader/writer. CLI-style get/set/list/defaults/edit.
  DEFAULTS table + validation.
  Ports gstack-config:72–168 to Node/JS.

packages/yp-stack/src/team-init.js
  Implements --team {optional|required} flow.
  CLAUDE.md snippet injection, .gitignore patching, vendored-migration,
  settings.json PreToolUse hook patching.
  Ports gstack-team-init:1–192 to Node.

packages/yp-stack/src/update-check.js
  Cache + snooze logic. Reads/writes ~/.yellowpages/ state files.
  Exports checkForUpdates() → returns one-line string or null.
  Ports gstack-update-check:60–211 to Node.

packages/yp-stack/src/templates/check-yp.sh
  Heredoc template for the project enforcement hook.

packages/yp-stack/src/templates/claude-md-optional.md
packages/yp-stack/src/templates/claude-md-required.md
  CLAUDE.md snippets for each team mode.

packages/yp-stack/test/config.test.js
  Round-trip get/set, validation, header write, DEFAULTS sync check.

packages/yp-stack/test/team-init.test.js
  Non-destructive CLAUDE.md append, .gitignore dedup, settings.json patch,
  vendored migration.

packages/yp-stack/test/update-check.test.js
  TTL boundaries, snooze level math, corrupt cache handling.
```

### Modified files

```
packages/yp-stack/bin/cli.js
  Add subcommands: config, team, snooze, reconfigure.
  Parse --team {optional|required} flag.

packages/yp-stack/src/index.js
  On entry, read ~/.yellowpages/config.yaml.
  Short-circuit any prompt whose key is set.
  Respect --reconfigure flag.
  Write config after successful first install.
  Surface config-resolved values in summary block.

packages/yp-stack/src/install.js
  Add --team branch that calls team-init.js instead of installing skills.
  Keep existing installFiles() path for global installs.
  Atomic settings.json writes (mktemp + rename).

hooks/skills-manifest.js
  Add update-check invocation after existing scan.
  Append one line to manifest output when upgrade state exists.
  Silent-fail on any filesystem or network error.

packages/yp-stack/package.json
  Add CLI subcommand routing to bin/cli.js.
  No new runtime deps (use built-in fs, https, child_process).

README.md
  Add "Team mode" section explaining --team {optional|required}.
  Add "Config" section pointing at ~/.yellowpages/config.yaml.
  Document that global install is canonical; project installs are enforcement only.

skills/yellowpages/SKILL.md
  Add one row to reference map for new yp-config skill (if scaffolded).

.agents/project-context.md
  Add note: yellowpages config lives at ~/.yellowpages/config.yaml.
  Team mode uses global install — skills are not vendored per-project.
```

---

## Migration Path

### Existing yellowpages users

1. Running `npx yp-stack` on an updated version detects no `~/.yellowpages/config.yaml` → runs the existing Clack flow (unchanged UX for first-time users), then writes the config at the end. One-time cost.
2. Running `npx yp-stack` in a second project → reads config, skips all prompts matched by config, shows summary, confirms. Expected total time: under 5 seconds.
3. Running `npx yp-stack --reconfigure` → forces the full Clack flow and overwrites the config.

### Existing project-vendored installs

1. User runs `npx yp-stack --team optional` (or `required`) in the repo root.
2. Team-init detects `.claude/skills/yellowpages/` as a real directory, prints a confirmation prompt, then:
   - `git rm -r --cached .claude/skills/yellowpages/`
   - Appends `.claude/skills/yellowpages/` to `.gitignore`
   - `rm -rf` the vendored directory
   - Writes enforcement kit files
3. User commits the migration: vendored skills leave the repo, tiny enforcement kit stays.

### Teammates pulling the migration commit

1. Pull commits.
2. Run `npx yp-stack` (no flags). Reads config if present, else runs full prompts. Writes to `~/.claude/skills/yellowpages/`.
3. `.claude/hooks/check-yp.sh` is satisfied on next Claude session. If they skip the install and `team_mode` is `required`, the PreToolUse hook blocks all Skill tool calls with the install instructions.

---

## Success Criteria

- A returning user with an existing `~/.yellowpages/config.yaml` can complete `npx yp-stack` in a new project with zero prompts (other than the final confirm).
- `yp config {get|set|list|defaults}` round-trips all keys in the DEFAULTS table without losing data.
- `yp config set` on a closed-domain key with an invalid value warns and coerces to default.
- `npx yp-stack --team required` produces a commit-ready enforcement kit with exactly four files: `CLAUDE.md` (appended), `.gitignore` (appended), `.claude/hooks/check-yp.sh`, `.claude/settings.json` (patched).
- The PreToolUse hook correctly blocks Skill tool use when `~/.claude/skills/yellowpages/.yp-version` is absent, and allows it when present.
- Running `--team optional` twice is idempotent (no duplicate CLAUDE.md section, no duplicate `.gitignore` entry, no duplicate hook registration in `settings.json`).
- Vendored-install migration removes the vendored copy, adds the gitignore entry, and does not touch any file outside the expected paths.
- Throttled update check emits at most one line per session, respects the 60/720-minute TTL split, resets snooze on remote version change, and silent-fails on network errors.
- `yp snooze` correctly sets levels 1/2/3 with the documented 24h/48h/7d durations.
- `bun lint` and `bun fmt:check` pass on all modified files in `packages/yp-stack/`.
- All new tests pass in `packages/yp-stack/test/`.
- Existing `test/install.test.js` continues to pass unchanged.

---

## Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Config file corruption breaks every install | Every `get` falls back to DEFAULTS on any parse failure. `config.js` treats missing or malformed lines as unset. |
| Shell config parser (grep+awk) diverges from Node parser | Keep parsing in Node only. No bash wrapper needed — `yp config` runs through the Node CLI. |
| `settings.json` patch corrupts existing user hooks | Dedup check scans for exact matcher + command substring. Atomic write via mktemp+rename. Round-tripped through `JSON.parse` + `JSON.stringify` preserves user formatting only loosely — documented as expected behavior. |
| Enforcement hook blocks developer work after accidental global uninstall | Hook deny message includes the exact install command. Message is shown to the agent via stderr and to the harness via the JSON `message` field. Recovery is one command. |
| Update check adds network latency to session start | Cache gates the network call (60/720 min TTL). `curl --max-time 5` caps slow-path cost. Silent-fail on any error — session never blocks. Respects `update_check: false`. |
| First-run users are confused by config file existence | Annotated header in the config file documents every key inline. `yp config list` surfaces all values + source (set vs. default). |
| Migrating a vendored install destroys uncommitted work | Migration runs `git rm -r --cached` first (preserves working tree until deleted). Prints a clear confirmation line before `rm -rf`. `--team` flow with an existing vendored copy should prompt confirmation before destructive action. |

---

## Out of Scope

- Replacing `npx yp-stack` with a `git clone` install model.
- Supabase telemetry, analytics pings, or community dashboards.
- Caveman intensity CLI flag (already handled by existing `/caveman` command).
- Per-project `yellowpages.config.json` — the new global config supersedes it for defaults. The existing per-project file stays as an install-record artifact only.
- Auto-upgrade execution — this spec adds the update-check surface but does not implement silent `git pull` / `npm update`. A future `/yp:upgrade` command owns execution.

---

## Rollout Order

1. Ship Phase 1 (config + installer short-circuit) as `yp-stack 0.6.0`. Non-breaking for existing users.
2. Dogfood internally for one week. Use `/yp:status` to verify config read on session start.
3. Ship Phase 2 (team mode) as `yp-stack 0.7.0`. Document migration path in release notes.
4. Migrate this repo's own `.claude/` via `--team required` as the first production use.
5. Ship Phase 3 (update check) as `yp-stack 0.8.0`. Bump VERSION in `package.json` to force one initial check cycle.
6. Ship Phase 4 (host config abstraction) in the same `0.5.x` line as Phases 1–3 — pure refactor + additive `hasCommandsSupport` field, back-compat shim preserves existing call sites.

---

## Open Questions

1. Should the config file format be YAML-ish (gstack-style `key: value`, grep-parseable) or JSON (consistent with existing `yellowpages.config.json`)? **Recommendation:** follow gstack — YAML-ish, annotated header is the dominant value. JSON headers cannot carry inline documentation.
2. Should `yp config edit` open `$EDITOR` or print the file path? **Recommendation:** both — open `$EDITOR` if set and TTY, otherwise print the path.
3. Should `--team required` prompt for confirmation before writing enforcement files, or write immediately? **Recommendation:** prompt by default, `--yes` flag to skip.
4. Should the update check run on every session or only when caveman injects its hook output? **Recommendation:** every session start, but only the first SessionStart fire (dedup via the existing manifest hook entry point). Session-level deduplication prevents duplicate output in tool-restart scenarios.
5. What VERSION source should the remote fetch use? `package.json` (current) or a dedicated `VERSION` file at repo root (gstack pattern)? **Recommendation:** dedicated `VERSION` file. Smaller response, no JSON parse, matches gstack's proven pattern.

---

## References

- Research notes with verified line citations: `docs/research/2026-04-19-gstack-source-notes.md`
- gstack source (read at `/tmp/gstack-reference/`):
  - `bin/gstack-config:72–168` — DEFAULTS table + set/get/list pattern
  - `bin/gstack-team-init:1–192` — team-init flow
  - `bin/gstack-update-check:60–211` — cache + snooze logic
  - `hosts/index.ts:28–29` — derived-union Host type (Phase 4 reference)
  - `docs/ADDING_A_HOST.md:1–100` — host config shape (Phase 4 reference)
- Existing yellowpages files this spec modifies:
  - `packages/yp-stack/src/index.js`
  - `packages/yp-stack/src/install.js`
  - `packages/yp-stack/src/platforms.js`
  - `packages/yp-stack/bin/cli.js`
  - `hooks/skills-manifest.js`
