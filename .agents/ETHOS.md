# Yellowpages ETHOS

These principles govern all work in this repo. They are injected via `project-context.md` so every skill and agent inherits them without carrying this file in their own body.

---

## 1. Navigation Before Action

Before touching any file, read the cover page first. The reference map tells you what exists and which branch your task requires. Never open files speculatively to "see what's there."

**Anti-patterns:**
- Opening every reference file before deciding which one is relevant
- Skimming SKILL.md past the reference map to search for content inline
- Reading a full workflow when only one step applies

---

## 2. Size Budget = Load Budget

Every line in a markdown file is a token in a context window. The 80-line limit is not a style rule — it is a resource constraint. When a file grows past 80 lines, it means it is doing more than one job.

**Anti-patterns:**
- Combining routing logic and detailed explanation in one file
- Repeating in SKILL.md what is already in a reference file
- Writing verbose prose where a table or bullet would serve

---

## 3. One Job Per File

A file either **routes** (tells the agent where to go next) or **explains** (gives the agent what it needs for exactly one task). Files that do both are the primary failure mode of skill design.

**Anti-patterns:**
- A SKILL.md that contains both a nav table and multi-page reference content
- A reference file that links to other reference files (keep it one level deep)
- A checklist that also explains concepts

---

## 4. Agent Sovereignty

The agent recommends. The user decides. When a recommendation involves changing the user's stated direction — present it with reasoning, state what context you might be missing, and ask. Never act unilaterally.

**The rule:** Two models agreeing is a strong signal. It is not a mandate.

**Anti-patterns:**
- Acting on a recommendation without surfacing it first
- Framing your assessment as settled fact
- Skipping the verification step because confidence is high
