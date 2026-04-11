# Progressive Disclosure

Skills use a 3-level loading system to keep context lean:

1. **Metadata** (`name` + `description`) — always in context, ~100 words
2. **SKILL.md body** — loaded when the skill triggers, ≤ 80 lines
3. **Reference files** — loaded on demand, no size limit (scripts can run without being read)

Keep SKILL.md as the "cover page." Details live in reference files, loaded only when needed.

## Splitting Patterns

### Pattern 1 — High-level guide with reference links

Keep the quick-start inline. Link to references for advanced paths:

```markdown
## PDF Processing

Extract text: [code example — 5 lines max inline]

For advanced features:
- **Form filling** → [references/forms.md](references/forms.md)
- **OOXML details** → [references/ooxml.md](references/ooxml.md)
```

### Pattern 2 — Domain-specific organization

For skills covering multiple domains, one reference file per domain:

```
bigquery-skill/
├── SKILL.md          (overview + "which domain?" decision)
└── references/
    ├── finance.md    (revenue, billing)
    ├── sales.md      (pipeline, opportunities)
    └── product.md    (API usage, features)
```

User asks about sales → Claude reads only `sales.md`.

### Pattern 3 — Variant branching

Same pattern for multi-framework or multi-provider skills:

```
cloud-deploy/
├── SKILL.md          (workflow + provider selection table)
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```

User picks AWS → Claude reads only `aws.md`.

## Rules

- **Keep references one level deep** — all reference files link directly from SKILL.md. No nested sub-sub references.
- **Table of contents for large files** — if a reference file exceeds 100 lines, open it with a TOC so Claude can decide which section is relevant before reading the whole file.
- **No duplication** — a fact lives in either SKILL.md or a reference file, never both.
- **State when to read** — every reference link must include a reason: *"Read when the user needs X."*
