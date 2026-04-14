# Skill Anatomy

## Folder Structure

```
skill-name/
├── SKILL.md              (required) — cover page, ≤ 80 lines
├── references/           (optional) — docs loaded into context as needed
├── scripts/              (optional) — executable code
└── assets/               (optional) — output files (templates, images, fonts)
```

## SKILL.md Sections

Every SKILL.md has two parts:

**Frontmatter (YAML)** — `name`, `description`, and optionally `command` + `argumentHint`. Name and description are read before the body to decide if the skill triggers. Description must be comprehensive — it is the only thing Claude reads at selection time. The `command` field registers the skill as a slash command in the session manifest.

**Body (Markdown)** — Instructions loaded after triggering. Keep ≤ 80 lines. Move detail to reference files.

## Resource Types

### `references/`
Documentation loaded into context **on demand**. Use for schemas, API docs, domain knowledge, workflow guides, detailed patterns.

- Load only when the specific sub-task requires it
- For files > 100 lines, open with a table of contents
- Avoid duplication: if something is in a reference file, don't repeat it in SKILL.md

### `scripts/`
Executable code for tasks that are fragile, repetitive, or must be deterministic.

- Run scripts rather than re-writing equivalent code each time
- Scripts may be executed without reading into context if the API supports it
- Always test new scripts before marking a skill complete

### `assets/`
Files used in output — not loaded into context, but copied or modified.

Examples: HTML/React boilerplate, logo PNGs, font files, PowerPoint templates, sample documents.

## What NOT to Include

Do not create auxiliary documentation files inside a skill folder:

- `README.md`
- `INSTALLATION_GUIDE.md`
- `CHANGELOG.md`
- `QUICK_REFERENCE.md`

A skill contains only what an agent needs to do the job. Setup guides, changelogs, and user-facing docs are clutter.
