# Yellowpages

Yellowpages is a progressive-disclosure skill library for AI agents. It keeps runtime context small by injecting one bootstrap skill, then loading every other skill only when the task calls for it.

## How It Works

At session start, the host injects `skills/yellowpages/using-yellowpages/SKILL.md`.

That bootstrap tells the agent:

- how to use native skill discovery,
- when to load a yellowpages skill,
- how to choose the right category router,
- and how to avoid loading the whole library at once.

Every other skill remains lazy-loaded through the host's native skill tool.

## Install

### Claude Code

Install from a Claude plugin marketplace that points at this repo, or register this repo as a development marketplace:

```bash
/plugin marketplace add nilsclabb/yellowpages
/plugin install yellowpages@yellowpages-dev
```

The Claude plugin metadata lives in `.claude-plugin/`, and the SessionStart hook lives in `hooks/`.

### Cursor

Install through Cursor's plugin system from this repository. The Cursor plugin manifest is `.cursor-plugin/plugin.json`.

The plugin exposes:

- `skills/yellowpages/` as the skill library,
- `.agents/agents/` as agent definitions,
- `commands/` as high-level chat command aliases,
- `hooks/hooks-cursor.json` for bootstrap injection.

### Gemini CLI

```bash
gemini extensions install https://github.com/nilsclabb/yellowpages
```

Gemini loads `GEMINI.md`, which imports the `using-yellowpages` bootstrap.

### OpenCode

Add yellowpages to `opencode.json`:

```json
{
  "plugin": ["yellowpages@git+https://github.com/nilsclabb/yellowpages.git"]
}
```

See `.opencode/INSTALL.md`.

### Codex

Codex uses native discovery from `~/.agents/skills/`:

```bash
git clone https://github.com/nilsclabb/yellowpages.git ~/.codex/yellowpages
mkdir -p ~/.agents/skills
ln -s ~/.codex/yellowpages/skills/yellowpages ~/.agents/skills/yellowpages
```

See `.codex/INSTALL.md`.

## Runtime Model

```text
SessionStart
  -> inject using-yellowpages only
  -> agent loads one category router
  -> category router selects one leaf skill
  -> leaf skill points to one reference file if needed
```

This is the core yellowpages rule: load only what the current task requires.

## Repo Layout

```text
skills/yellowpages/       installable skills, single source of truth
  using-yellowpages/      bootstrap skill injected at session start
  yp-workflow/            coding-session workflow router
  yp-skill-system/        yellowpages/skill maintenance router
  yp-stack-router/        stack and domain router
  yp-session-tools/       session/context utility router
  SKILL.md                yellowpages authoring standard
  INDEX.md                skill discovery index
  references/             core reference files
  <skill-name>/           individual skills

.agents/                 governance layer: workflows, checklists, templates, state
.claude-plugin/          Claude plugin metadata
.cursor-plugin/          Cursor plugin metadata
.opencode/               OpenCode plugin entrypoint and install docs
.codex/                  Codex install docs
commands/                high-level chat command aliases
hooks/                   native SessionStart bootstrap hooks
```

## Commands

Commands are not the skill registry. They are optional intent shortcuts:

| Command | Meaning |
|---|---|
| `/yellowpages` | Route the current request through yellowpages |
| `/yp` | Alias for `/yellowpages` |

Skills are discovered and loaded through native skill tooling.

## Skill Design Rules

| Rule | Meaning |
|---|---|
| Cover-page brevity | `SKILL.md` stays short and routes to details |
| One job per file | A file routes or explains, never both |
| Load on demand | Read sub-files only when the task requires them |
| Deep-link navigation | Every reference includes when to read it |
| Flat skill namespace | Sibling skills, not nested skill trees |

## Development

Validate skills:

```bash
python skills/yellowpages/scripts/quick_validate.py --all skills/yellowpages
```

Behavioral tests should verify that natural prompts trigger the correct skills. See the Superpowers-style testing pattern in future `tests/skill-triggering/` work.

## Contributing

Read `CONTRIBUTING.md` before opening a PR.

## License

MIT
