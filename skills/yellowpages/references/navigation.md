# Navigation

This file defines how agents should navigate between skills, sub-files, docs, and codebases without bloating context.

## Skill Navigation Protocol

1. **Read the cover page first.** Always start with `SKILL.md`. The reference map tells you what exists and when to read each file.
2. **Follow only the branch you need.** If the user's task matches one reference file, read only that file. Do not pre-emptively read siblings.
3. **Use category routers before INDEX.md.** Runtime routing starts at `using-yellowpages`, then one category router. Use `INDEX.md` for audits and maintenance.
4. **One level at a time.** Read the cover page → decide if a reference is needed → read that reference → decide if it links further. Never load entire skill trees speculatively.

## Codebase Navigation Protocol

When exploring an unfamiliar codebase:

1. **Start shallow.** List the root directory. Identify top-level structure before opening any files.
2. **Read entry points first.** `README.md`, `package.json`, `pyproject.toml`, `main.*`, `index.*` — these reveal architecture fastest.
3. **Grep before deep reads.** Use search/grep to locate relevant symbols, patterns, or filenames before reading full files.
   ```
   grep -r "function handlePayment" src/
   ```
4. **Read only the relevant section.** When a file is large (> 200 lines), read only the lines around the target symbol or function.
5. **Build a mental map incrementally.** After each file, decide: *"Do I have enough context to act, or do I need one more file?"* Stop when you can act.

## Documentation Navigation

**Committed specs** (design docs, repo-persistent, produced by `yp-brainstorm`):

```
docs/specs/YYYY-MM-DD-<topic>-design.md
```

**Committed plans** (implementation plans, repo-persistent, produced by `yp-auto-plan`):

```
docs/plans/YYYY-MM-DD-<feature>.md
```

**Ephemeral plans** (session-scoped, not committed):

```
<appDataDir>/brain/<conversation-id>/
├── implementation_plan.md
├── task.md
└── walkthrough.md
```

When picking up work from a prior session, check `docs/plans/` and `docs/specs/` first. To find context from past conversations, check KI summaries first, then conversation logs.

**Write new design and plan files under `docs/specs/` and `docs/plans/` — never under a third-party plugin namespace.**

## INDEX.md Usage

`INDEX.md` is for repository audits, maintenance, and checking category coverage. Runtime skill selection should use the router ladder first.

```markdown
| Skill | Triggers on | Covers |
|---|---|---|
| yellowpages | "create a skill", "skill standard", "how to document" | Skill creation, design, navigation |
```
