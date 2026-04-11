# Navigation

This file defines how agents should navigate between skills, sub-files, docs, and codebases without bloating context.

## Skill Navigation Protocol

1. **Read the cover page first.** Always start with `SKILL.md`. The reference map tells you what exists and when to read each file.
2. **Follow only the branch you need.** If the user's task matches one reference file, read only that file. Do not pre-emptively read siblings.
3. **Check INDEX.md before searching.** When you need a skill but aren't sure which one, read `INDEX.md` (≤ 30 lines) rather than scanning all SKILL.md files.
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

Planning documents live at:
```
<appDataDir>/brain/<conversation-id>/
├── implementation_plan.md
├── task.md
└── walkthrough.md
```

To find context from past conversations, check KI (Knowledge Items) summaries first, then conversation logs. Read `overview.txt` in a conversation log only when a KI is insufficient.

## INDEX.md Usage

`INDEX.md` at the skill folder root is the fastest way to find the right skill. Read it like a phone book entry — one row tells you if a skill is relevant without loading its full SKILL.md.

```markdown
| Skill | Triggers on | Covers |
|---|---|---|
| skill-creator | "create a skill", "new skill" | Skill scaffolding, packaging |
| yellowpages | "skill standard", "how to document" | Meta-skill rules, navigation |
```
