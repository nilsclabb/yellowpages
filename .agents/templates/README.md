# Templates Directory

This directory contains **document scaffolds** — pre-structured templates that agents fill in to produce consistent, reusable artifacts. Templates are not loaded into context speculatively; agents copy and fill them only when producing that specific document type.

## Template File Standard

A template is a markdown file with:
- A brief comment block at the top explaining what to fill in (wrapped in `<!-- -->`)
- The document structure using placeholders in `[CAPS]` or `{{curly_braces}}`
- Embedded `<!-- LLM: instruction -->` comments to guide the agent on non-obvious sections

```markdown
<!-- Template: <Name>
     Purpose: [what artifact this produces]
     Fill in all [PLACEHOLDER] values before delivering. -->

# [DOCUMENT TITLE]

## Section One
[Content here]

<!-- LLM: Keep this section under 200 words. Focus on the decision, not the rationale. -->

## Section Two
[Content here]
```

## Available Templates

| Template | Produces |
|---|---|
| [skill-template.md](skill-template.md) | A blank `SKILL.md` scaffold ready to fill |

## Adding a New Template

1. Create `<name>.md` in this directory
2. Add a row to the table above
3. Add a row to `.agents/skills/yellowpages/INDEX.md`
