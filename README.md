# Yellowpages

Yellowpages is a progressive-disclosure skill library for AI agents. It keeps runtime context small by injecting one bootstrap skill, then loading category routers, leaf skills, and reference files only when the current request needs them.

The old `yp-stack` npm installer has been removed. Yellowpages now installs through each host's native plugin, extension, or skill-discovery mechanism.

## Runtime Model

At session start, the host injects only:

```text
skills/yellowpages/using-yellowpages/SKILL.md
```

That bootstrap teaches the agent this routing ladder:

```text
using-yellowpages -> category router -> leaf skill -> reference file
```

The important rule is: load one step at a time and stop as soon as there is enough context to act.

## Category Routers

| Router | Use for |
|---|---|
| `yp-workflow` | Normal coding-session work: frame, design, plan, execute, verify, review |
| `yp-skill-system` | Yellowpages itself: authoring, validation, diagnostics, skill management |
| `yp-stack-router` | Stack/domain guidance: Convex, React, UI, monorepos, preferred tooling |
| `yp-session-tools` | Help, status, injected context, notes, reloads, compression |

`yp-workflow` is the default for normal software-engineering requests. `yp-stack-router` is opt-in for stack, framework, architecture, or tooling questions.

## Workflow Model

The software-building workflow is now a tiny default core with optional capabilities:

```text
using-yellowpages -> yp-workflow -> core stage -> optional capability -> reference
```

### Core stages

| Stage | Skill | Purpose |
|---|---|---|
| Frame | `yp-workflow-frame` | clarify the request, assumptions, and success criteria |
| Design | `yp-workflow-design` | compare approaches and define the simplest sufficient design |
| Plan | `yp-workflow-plan` | turn approved scope into an implementation plan |
| Execute | `yp-workflow-execute` | perform the work with minimal, surgical changes |
| Verify | `yp-workflow-verify` | require fresh evidence before completion claims |
| Review | `yp-workflow-review` | inspect correctness, readiness, and review feedback |

### Optional workflow capabilities

These are loaded only when useful, not by default:

- `yp-workflow-subagents`
- `yp-workflow-parallel-agents`
- `yp-workflow-git-worktrees`
- `yp-workflow-tdd`
- `yp-workflow-debugging`
- `yp-workflow-review-loops`
- `yp-workflow-handoffs`

Legacy workflow skills remain for compatibility during the transition:
`yp-brainstorm`, `yp-auto-plan`, `yp-tasks`, `yp-verify`, `pr-code-review`.

## Install

### Claude Code

Install from a Claude plugin marketplace that points at this repo, or register this repo as a development marketplace:

```bash
/plugin marketplace add nilsclabb/yellowpages
/plugin install yellowpages@yellowpages-dev
```

Claude plugin metadata lives in `.claude-plugin/`. SessionStart bootstrap hooks live in `hooks/`.

### Cursor

Install through Cursor's plugin system from this repository. The Cursor plugin manifest is `.cursor-plugin/plugin.json`.

The plugin exposes:

- `skills/yellowpages/` as the skill library
- `.agents/agents/` as agent definitions
- `commands/` as high-level chat command aliases
- `hooks/hooks-cursor.json` for bootstrap injection

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

## Repo Layout

```text
skills/yellowpages/       installable skills, single source of truth
  using-yellowpages/      bootstrap skill injected at session start
  yp-workflow/            coding-session workflow router
  yp-skill-system/        yellowpages/skill maintenance router
  yp-stack-router/        stack and domain router
  yp-session-tools/       session/context utility router
  SKILL.md                yellowpages authoring standard
  INDEX.md                audit/discovery index
  references/             core reference files
  scripts/                validation and utility scripts
  yp-workflow-*/          workflow core + optional capability leaf skills
  <skill-name>/           other leaf skills

.agents/                 governance: agents, workflows, checklists, templates, state
.claude-plugin/          Claude plugin metadata
.cursor-plugin/          Cursor plugin metadata
.opencode/               OpenCode plugin entrypoint and install docs
.codex/                  Codex install docs
commands/                high-level chat command aliases
hooks/                   native SessionStart bootstrap hooks
```

All installable skills live in `skills/yellowpages/`. Do not duplicate skills into `.agents/`.

## Commands

Commands are not the skill registry. They are optional intent shortcuts:

| Command | Meaning |
|---|---|
| `/yellowpages` | Route the current request through Yellowpages |
| `/yp` | Alias for `/yellowpages` |

Leaf skills load through native skill tooling, not one-command-per-skill mirrors.

## Skill Design Rules

| Rule | Meaning |
|---|---|
| Cover-page brevity | `SKILL.md` stays at or under 80 lines |
| One job per file | A file routes or explains, never both |
| Load on demand | Read only the branch required by the task |
| Deep-link navigation | Every reference states when to read it |
| Flat skill namespace | Skills are sibling folders under `skills/yellowpages/` |

## Development

Validate all skills:

```bash
python3 skills/yellowpages/scripts/quick_validate.py --all skills/yellowpages
```

Expected result for the current tree:

```text
Results: 44 passed, 0 failed, 44 total
```

Validate native manifests and hooks:

```bash
node -e "const fs=require('fs'); for (const f of ['.claude-plugin/plugin.json','.claude-plugin/marketplace.json','.cursor-plugin/plugin.json','gemini-extension.json','package.json','hooks/hooks.json','hooks/hooks-cursor.json']) JSON.parse(fs.readFileSync(f,'utf8')); console.log('json ok')"
bash -n hooks/session-start && bash -n hooks/run-hook.cmd
```

Behavioral tests should verify that natural prompts trigger the right category router first, then the correct leaf skill.

## Contributing

Read `CONTRIBUTING.md` before opening a PR.

## License

MIT
