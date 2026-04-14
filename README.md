# Yellowpages

A modular, navigable skill architecture for AI agents. Skills are organized like a phone directory: every entry is a short cover page (≤ 80 lines) that points to the right detail file — never a wall of text.

Built for teams who want reusable, shareable agent capabilities that don't bloat token context.

---

## The problem

Agent instructions grow into walls of text. Agents read everything upfront — including parts they'll never need — and still get lost when rules conflict or context runs out.

Yellowpages fixes this with one rule: **every skill is a cover page that routes, not explains.** Agents load detail only when the task requires it.

---

## Install

**Interactive guided setup** (platform detection, scope selection, optional CLAUDE.md integration):

```bash
npx yp-stack
```

**Via skills.sh** (works with Claude Code, Cursor, Copilot, and 40+ agents):

```bash
npx skills add nilsclabb/yellowpages
```

Both options support project-local installs (`.claude/skills/`, `.cursor/skills/`, etc.) and global installs (`~/.claude/skills/`).

---

## How it works

A yellowpages-compliant skill has three layers:

```
my-skill/
├── SKILL.md          ← Cover page (≤ 80 lines). Routes to references.
├── INDEX.md          ← Lists every sub-skill and its trigger (≤ 30 lines).
└── references/       ← Detail files. One job per file. Loaded on demand.
    ├── setup.md
    ├── patterns.md
    └── ...
```

**SKILL.md** is all an agent reads by default. It names what this skill does and lists exactly which reference file to load for each kind of task — with a `when:` annotation for every link. Agents never guess.

**INDEX.md** is a 30-line master listing. An agent scanning for the right skill reads this first. Each entry fits on one line.

**references/** hold the real content, split by job. A file either routes or explains — never both.

---

## The five rules

| Rule | What it means |
|---|---|
| Cover-page brevity | `SKILL.md` ≤ 80 lines |
| One job per file | A file routes *or* explains, never both |
| Load on demand | Agents read sub-files only when the task requires it |
| Deep-link navigation | Every reference link includes *when* to read it |
| Self-documenting index | `INDEX.md` ≤ 30 lines, one entry per skill |

---

## What's in this repo

```
skills/yellowpages/               ← All installable skills (single source of truth)
    ├── SKILL.md                      ← Main cover page
    ├── INDEX.md                      ← Skill discovery index
    ├── SKILLS-INDEX.md               ← Utility command reference
    ├── references/                   ← 15 core reference files
    ├── scripts/                      ← Python utilities
    │   ├── init_skill.py                 ← Scaffold a new skill
    │   ├── package_skill.py              ← Package into .skill zip
    │   └── quick_validate.py             ← Validate skill compliance
    ├── caveman/                      ← Terse agent communication
    ├── manage-global-skills/         ← Global skill library management
    ├── manage-project-skills/        ← Project skill context management
    ├── scaffold-skill/               ← Create new skills
    ├── validate-skill/               ← Quality checklist
    ├── yp-help/                      ← Quick reference card
    ├── yp-status/                    ← Session health check
    ├── yp-tasks/                     ← Task orchestration
    ├── auto-plan/                    ← Generate TASKS.md from description
    └── ... (24 skills total)

packages/yp-stack/                ← NPM interactive installer (v0.3.0)
    ├── bin/cli.js                    ← Entry point
    ├── src/
    │   ├── index.js                      ← Interactive setup flow
    │   ├── platforms.js                  ← Platform detection (8 agents)
    │   ├── install.js                    ← File installation logic
    │   ├── skills-manager.js             ← SessionStart hook installer
    │   ├── caveman.js                    ← Caveman mode installer
    │   ├── content.js                    ← Generated: bundled skill content
    │   └── hooks.js                      ← Generated: hook constants + version
    ├── scripts/
    │   └── bundle-content.js             ← Bundles skills/ + .agents/ + hooks/
    └── test/
        └── install.test.js               ← 18-test install verification suite

hooks/                            ← SessionStart hook source files
    ├── skills-manifest.js            ← Skill inventory + manifest injection
    ├── caveman-activate.js           ← Caveman mode activation
    ├── caveman-mode-tracker.js       ← /caveman command tracking
    └── install.sh                    ← Shell installer for repo cloners

.agents/                          ← Governance layer (no skills — those live in skills/)
    ├── project-context.md            ← Repo constitution
    ├── ETHOS.md                      ← Builder principles
    ├── agents/                       ← Agent personas
    ├── workflows/                    ← Multi-step workflows
    ├── checklists/                   ← Quality gates
    ├── templates/                    ← Blank scaffolds
    └── state/                        ← Cross-session learnings and gate status
```

---

## Supported platforms

The installer detects and configures for:

- **Claude Code** — writes to `.claude/skills/`, optional `CLAUDE.md` integration, SessionStart hook
- **Cursor** — writes to `.cursor/skills/`
- **Windsurf** — writes to `.codeium/windsurf/skills/`
- **GitHub Copilot** — writes to `.copilot/skills/`
- **Cline** — writes to `.cline/skills/`
- **Roo Code** — writes to `.roo/skills/`
- **OpenCode** — writes to `.opencode/skills/`
- **Generic** — writes to `.agents/skills/`

Platform detection checks both the current directory and home directory, so Claude Code is always detected for global installs.

---

## Built-in skills

`yp-stack` installs **24 skills** to `~/.claude/skills/yellowpages/` and a `skills-manifest.js` SessionStart hook that injects a compact skill index every session. Type `/yp:help` in any session to see all available commands.

### Utility commands

| Command | What it does |
|---|---|
| `/yp:help` | Quick reference card |
| `/yp:status` | Session health check |
| `/yp:context` | See everything the agent loaded at startup |
| `/yp:session` | Model info and context pressure |
| `/yp:manage-global` | Inventory and manage globally installed skill libraries |
| `/yp:manage-project` | Inventory and manage current project's skill context |
| `/yp:scaffold <name>` | Create new yellowpages-compliant skill |
| `/yp:validate <path>` | Run quality checklist on any skill |
| `/yp:diagnose` | Skill doctor — find and fix compliance issues |
| `/yp:tasks` | View, claim, and complete tasks in TASKS.md |
| `/yp:auto-plan` | Generate TASKS.md from a description of work |

---

## Creating your own skills

Use the scaffold script to start a new skill:

```bash
python skills/yellowpages/scripts/init_skill.py my-skill --path ./skills
```

Then validate it before shipping:

```bash
python skills/yellowpages/scripts/quick_validate.py ./skills/my-skill
```

The yellowpages skill itself is the canonical example. Start by reading `skills/yellowpages/SKILL.md`.

If you encounter unfamiliar terms (cover page, routing file, ephemeral plan, gate, etc.), the glossary has you covered:

```
skills/yellowpages/references/encyclopedia.md
```

---

## Install options

When you run `npx yp-stack`, you choose:

| Mode | What installs |
|---|---|
| Full stack | Skill + references + scripts + workflows + checklists + templates + state tracking |
| Skill only | Skill + references + scripts |
| Minimal | `SKILL.md` cover page only (preview) |

---

## Development

```bash
cd packages/yp-stack
npm run bundle    # Regenerate content.js + hooks.js from source
npm test          # Bundle + run 14-test install verification suite
bun lint          # oxlint — 0 errors required
bun fmt:check     # oxfmt  — all files must be formatted
bun fmt           # auto-fix formatting
```

### Key rules

- **Single source of truth**: all skills live in `skills/yellowpages/`. Never duplicate into `.agents/`.
- **After editing skills or hooks**: run `npm run bundle` to regenerate the installer.
- **Generated files** (`src/content.js`, `src/hooks.js`) are gitignored — rebuilt by `npm run bundle` and CI `prepublishOnly`.
- **Hook constants** are auto-generated from `hooks/` source files. Edit the source, re-bundle — no manual sync.
- Both `bun lint` and `bun fmt:check` must pass before marking any task in that package complete.

---

## Requirements

- Node.js 18+

---

## Inspiration

Yellowpages builds on ideas from projects that shaped how it thinks about agent skill systems:

- **[gstack](https://github.com/garrytan/gstack)** — for its opinionated approach to structuring AI agent capabilities as composable, discoverable units
- **[superpowers](https://github.com/obra/superpowers)** — for demonstrating how shareable agent enhancements can be distributed and installed across different environments
- **[pi code](https://github.com/badlogic/pi-mono)** — for its patterns around progressive disclosure and keeping agent context lean
- **[lawn](https://github.com/pingdotgg/lawn)** and **[t3code](https://github.com/pingdotgg/t3code)** (ping.gg) — for their patterns around quality gates, committed plan conventions, project-level agent philosophy docs, and the encyclopedia/glossary approach to self-documenting agent systems

---

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

---

## License

MIT

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
