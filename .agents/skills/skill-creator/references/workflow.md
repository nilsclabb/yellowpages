# Skill Creation Workflow

Creating a skill involves 6 steps. Follow them in order; skip only when clearly not applicable.

## Step 1 — Understand with Concrete Examples

Gather specific examples of how the skill will be triggered and used. Ask:

- "What should this skill support — what actions or outputs?"
- "What would a user say to trigger it?"
- "Can you give 2–3 example requests?"

Don't ask too many questions at once. Start with the most important, follow up as needed.

**Done when:** you can articulate 3+ concrete usage examples.

## Step 2 — Plan Reusable Contents

For each example, ask: *"What resource would make this task repeatable?"*

| Task type | Likely resource |
|---|---|
| Same code rewritten each time | `scripts/rotate_pdf.py` |
| Tables / schemas re-discovered each time | `references/schema.md` |
| Same boilerplate HTML/React each time | `assets/hello-world/` |

Output a list of scripts, references, and assets to create.

## Step 3 — Initialize the Skill

Run the init script to scaffold the folder with correct structure:

```bash
python scripts/init_skill.py <skill-name> --path <output-directory>
```

Skip this step only if the skill already exists and you're iterating.

## Step 4 — Edit the Skill

1. **Build resources first** — implement scripts, reference files, and assets before writing SKILL.md.
2. **Test scripts** — run every new script at least once; test a representative sample for similar scripts.
3. **Write SKILL.md last** — once resources exist, write the cover page linking to them.
4. **Delete unused examples** — the init script creates placeholder files; remove any that aren't needed.

Consult these references while editing:
- Writing instructions → [authoring.md](authoring.md)
- Splitting content → [progressive-disclosure.md](progressive-disclosure.md)
- Output format patterns → [output-patterns.md](output-patterns.md)
- Sequential/conditional flow → [workflows.md](workflows.md)

## Step 5 — Package

```bash
python scripts/package_skill.py <path/to/skill-folder>
```

The script validates then packages into a `.skill` zip file. Fix any validation errors and re-run.

Validation checks:
- YAML frontmatter format and required fields
- Naming conventions and directory structure
- Description completeness

## Step 6 — Iterate

After real usage, notice struggles or inefficiencies, then update SKILL.md or resources. The best improvements come immediately after using the skill, with fresh context on where it fell short.
