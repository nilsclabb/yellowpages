---
name: yp-brainstorm
description: You MUST use this before any creative work — creating features, building components, adding functionality, modifying behavior, or any conversation that starts with "I want to build X", "let's add Y", "thinking about Z", "how should we", "idea for", "design", or "plan for". Turns ideas into fully formed designs and specs through interview-style collaboration before any implementation happens.
---

# Brainstorm

Turn ideas into fully formed designs through natural collaborative dialogue. Interview the user, propose approaches, present the design, get approval, write a spec, then chain to planning.

<HARD-GATE>
Do NOT invoke any implementation skill, write any code, scaffold any project, or take any implementation action until you have presented a design and the user has explicitly approved it. This applies to EVERY project regardless of perceived simplicity. The only skill you may invoke after brainstorming is `yp-auto-plan`.
</HARD-GATE>

## Anti-Pattern: "This is too simple to need a design"

Every idea for new or changed behavior goes through this process. A todo list, a single-function utility, a config change — all of them. "Simple" projects are where unexamined assumptions cause the most wasted work. The design can be short (a few sentences for truly simple projects), but you MUST present it and get approval.

## Trivial-Edit Carveout

This skill does NOT apply to genuinely trivial edits: a typo fix, a single-line change with no new symbols and no behavior change, a comment tweak, an import reorder. Apply the test: "does this change behavior, add a symbol, or make a decision?" If no to all three, skip the brainstorm and do the edit directly. When in doubt, brainstorm.

## Checklist

Create a TodoWrite task for each item and complete them in order:

1. **Explore project context** — check `CLAUDE.md`, `.agents/project-context.md`, recent commits, related files
2. **Scope check** — if the request covers multiple independent subsystems, flag it and help decompose into sub-projects before proceeding
3. **Ask clarifying questions** — one at a time, multiple choice preferred, focus on purpose/constraints/success criteria
4. **Propose 2–3 approaches** — with trade-offs and your recommendation
5. **Present the design** — in sections scaled to complexity, get approval after each section
6. **Write the spec** — save to `docs/specs/YYYY-MM-DD-<topic>-design.md` and commit
7. **Spec self-review** — scan for placeholders, contradictions, ambiguity; fix inline
8. **User reviews the spec file** — ask the user to read it and request changes before moving on
9. **Hand off to `yp-auto-plan`** — once the spec is approved, that is the ONLY next skill to invoke

## Reference Map

| When you need to... | Read |
|---|---|
| Run the interview (question patterns, scope decomposition) | [references/interview.md](references/interview.md) |
| Structure the spec document (required sections, example) | [references/spec-format.md](references/spec-format.md) |

## Key Principles

- **One question at a time** — never batch questions in a single message
- **Multiple choice preferred** — easier to answer than open-ended
- **YAGNI ruthlessly** — cut unnecessary features from every design
- **Explore alternatives** — always propose 2–3 approaches before settling
- **Incremental validation** — present design in sections, confirm each before moving on
- **Be flexible** — go back and re-clarify when something doesn't add up

## Terminal State

The brainstorming skill terminates by invoking `yp-auto-plan`. Do not invoke any implementation skill directly. The chain is: **`yp-brainstorm` → `yp-auto-plan` → `yp-tasks`**.
