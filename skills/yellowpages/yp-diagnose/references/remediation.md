# Diagnose — Remediation Instruction Format

Output must be readable by both human AND agent. Use these instruction keywords:

## EXTRACT

```
EXTRACT: lines <A>–<B> → create references/<descriptive-name>.md
```

Use when SKILL.md is over 80 lines. Identify which lines contain explanatory content (not routing). Name the target file after what it explains.

## KEEP

```
KEEP: lines <C>–<D> in SKILL.md (frontmatter + routing table)
```

Always pair with EXTRACT. Specifies what stays in the cover page.

## ADD

```
ADD: "when to read" annotation to reference link on line <N>
```

Or for multiple links:
```
ADD: annotation column to links table at lines <X>, <Y>, <Z>
```

## CREATE

```
CREATE: <filename> with entry: | `<skill>` | <trigger> | [SKILL.md](<path>) |
```

Use when index entry is missing.

## REMOVE

```
REMOVE: <filename> (auxiliary doc not allowed in skill folder)
```

## FIX

```
FIX: rename `name:` value from "<current>" to "<directory-name>"
```

## Execution order

When agent executes on "yes":
1. EXTRACT operations first (create new files)
2. KEEP / truncate SKILL.md
3. ADD annotations
4. CREATE index entries
5. REMOVE auxiliary docs
6. FIX frontmatter
7. Run `validate-skill` on `<path>` to confirm all checks now pass
