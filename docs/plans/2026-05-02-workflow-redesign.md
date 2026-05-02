# Workflow Redesign Implementation Plan

_Spec: [2026-05-02-workflow-redesign-design](../specs/2026-05-02-workflow-redesign-design.md)_ · _Date: 2026-05-02_

> **For agents:** Use `yp-tasks pickup` to claim and execute tasks in order. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old five-skill workflow framing with a lean six-stage workflow plus shared optional capabilities, while preserving compatibility and installability.

**Architecture:** Keep `using-yellowpages` unchanged, refactor `yp-workflow` into a compact stage router, add new `yp-workflow-*` stage and capability skills, and convert the old workflow skills into small compatibility shims. Update repo docs and add a reusable reinstall prompt for operators.

**Tech Stack:** Markdown skills, Yellowpages routing conventions, shell-based install verification.

---

## File Structure

- Modify: `skills/yellowpages/yp-workflow/SKILL.md` — replace old five-skill routing with the new six-stage lifecycle and capability entrypoints
- Create: `skills/yellowpages/yp-workflow-frame/SKILL.md` — framing stage
- Create: `skills/yellowpages/yp-workflow-design/SKILL.md` — design stage
- Create: `skills/yellowpages/yp-workflow-plan/SKILL.md` — planning stage
- Create: `skills/yellowpages/yp-workflow-execute/SKILL.md` — execution stage
- Create: `skills/yellowpages/yp-workflow-verify/SKILL.md` — verification stage
- Create: `skills/yellowpages/yp-workflow-review/SKILL.md` — review stage
- Create: `skills/yellowpages/yp-workflow-subagents/SKILL.md` — optional subagent delegation capability
- Create: `skills/yellowpages/yp-workflow-parallel-agents/SKILL.md` — optional parallel-agent capability
- Create: `skills/yellowpages/yp-workflow-git-worktrees/SKILL.md` — optional worktree capability
- Create: `skills/yellowpages/yp-workflow-tdd/SKILL.md` — optional TDD capability
- Create: `skills/yellowpages/yp-workflow-debugging/SKILL.md` — optional debugging capability
- Create: `skills/yellowpages/yp-workflow-review-loops/SKILL.md` — optional review-loop capability
- Create: `skills/yellowpages/yp-workflow-handoffs/SKILL.md` — optional reporting/handoff capability
- Modify: `skills/yellowpages/yp-brainstorm/SKILL.md` — compatibility shim to `yp-workflow-frame` and `yp-workflow-design`
- Modify: `skills/yellowpages/yp-auto-plan/SKILL.md` — compatibility shim to `yp-workflow-plan`
- Modify: `skills/yellowpages/yp-tasks/SKILL.md` — narrow to execution coordination helper under `yp-workflow-execute`
- Modify: `skills/yellowpages/yp-verify/SKILL.md` — compatibility shim to `yp-workflow-verify`
- Modify: `skills/yellowpages/pr-code-review/SKILL.md` — retain as specialized PR review skill aligned with `yp-workflow-review`
- Modify: `skills/yellowpages/INDEX.md` — reflect the new workflow structure
- Modify: `README.md` — document the new lifecycle and capability model
- Modify: `docs/specs/2026-05-02-workflow-redesign-design.md` — mark approved and resolve naming/open migration choices
- Create: `docs/reinstall/2026-05-02-workflow-reinstall-prompt.md` — reusable operator prompt to wipe and reinstall the updated library

### Task 1: Approve naming and document the new workflow tree

**Files:**
- Modify: `docs/specs/2026-05-02-workflow-redesign-design.md`
- Modify: `skills/yellowpages/INDEX.md`
- Modify: `README.md`

- [ ] **Step 1: Update the spec to lock naming and migration choices**

```md
- Use `yp-workflow-<stage>` for the six core stages
- Keep legacy skills as one-release compatibility shims
- Keep `pr-code-review` as a specialized review leaf under `yp-workflow-review`
```

- [ ] **Step 2: Rewrite workflow references in index and README**

Run: update the workflow section to show the six-stage lifecycle plus shared capabilities.
Expected: docs reflect `yp-workflow -> yp-workflow-*` rather than the old five-skill chain.

- [ ] **Step 3: Review the updated docs for coherence**

Run: check that naming is consistent across spec, README, and INDEX.
Expected: no conflicting stage names or old chain descriptions remain in those files.

### Task 2: Replace the workflow router and add the new stage skills

**Files:**
- Modify: `skills/yellowpages/yp-workflow/SKILL.md`
- Create: `skills/yellowpages/yp-workflow-frame/SKILL.md`
- Create: `skills/yellowpages/yp-workflow-design/SKILL.md`
- Create: `skills/yellowpages/yp-workflow-plan/SKILL.md`
- Create: `skills/yellowpages/yp-workflow-execute/SKILL.md`
- Create: `skills/yellowpages/yp-workflow-verify/SKILL.md`
- Create: `skills/yellowpages/yp-workflow-review/SKILL.md`

- [ ] **Step 1: Replace the router**

```md
| User intent | Load |
|---|---|
| Clarify, scope, define success | `yp-workflow-frame` |
| Compare approaches, shape design | `yp-workflow-design` |
| Turn approved scope into an implementation plan | `yp-workflow-plan` |
| Carry out approved work or coordinated tasks | `yp-workflow-execute` |
| Prove completion claims with fresh evidence | `yp-workflow-verify` |
| Review correctness, readiness, or PR quality | `yp-workflow-review` |
```

- [ ] **Step 2: Write compact stage skills**

Run: create each `yp-workflow-<stage>` skill with purpose, required behavior, stop/ask rules, stage exit criteria, and capability links.
Expected: each `SKILL.md` stays within Yellowpages size budget.

- [ ] **Step 3: Sanity check stage routing**

Run: re-read the seven workflow files and confirm the lifecycle is coherent.
Expected: `frame -> design -> plan -> execute -> verify -> review` is obvious and stable.

### Task 3: Add optional capability skills and migrate legacy entrypoints

**Files:**
- Create: `skills/yellowpages/yp-workflow-subagents/SKILL.md`
- Create: `skills/yellowpages/yp-workflow-parallel-agents/SKILL.md`
- Create: `skills/yellowpages/yp-workflow-git-worktrees/SKILL.md`
- Create: `skills/yellowpages/yp-workflow-tdd/SKILL.md`
- Create: `skills/yellowpages/yp-workflow-debugging/SKILL.md`
- Create: `skills/yellowpages/yp-workflow-review-loops/SKILL.md`
- Create: `skills/yellowpages/yp-workflow-handoffs/SKILL.md`
- Modify: `skills/yellowpages/yp-brainstorm/SKILL.md`
- Modify: `skills/yellowpages/yp-auto-plan/SKILL.md`
- Modify: `skills/yellowpages/yp-tasks/SKILL.md`
- Modify: `skills/yellowpages/yp-verify/SKILL.md`
- Modify: `skills/yellowpages/pr-code-review/SKILL.md`

- [ ] **Step 1: Create reusable capability skills**

```md
- `yp-workflow-subagents`
- `yp-workflow-parallel-agents`
- `yp-workflow-git-worktrees`
- `yp-workflow-tdd`
- `yp-workflow-debugging`
- `yp-workflow-review-loops`
- `yp-workflow-handoffs`
```

- [ ] **Step 2: Convert legacy skills into compatibility shims or narrowed helpers**

Run: rewrite old workflow skills so they point to the new stages instead of duplicating the methodology.
Expected: old entrypoints remain usable but no longer define the core architecture.

- [ ] **Step 3: Re-read for duplication control**

Run: inspect the legacy skills plus new capability skills.
Expected: heavy guidance lives in one place, and old skills no longer carry the full workflow.

### Task 4: Add reinstall operator guidance and verify the skill tree

**Files:**
- Create: `docs/reinstall/2026-05-02-workflow-reinstall-prompt.md`

- [ ] **Step 1: Draft the reinstall prompt**

```md
Goal: wipe current Yellowpages install surfaces on the local machine, reinstall the updated repo, restore bootstrap hooks, and verify discovery.
```

- [ ] **Step 2: Run repository validation**

Run: `python3 skills/yellowpages/scripts/quick_validate.py --all skills/yellowpages`
Expected: all skills pass size and structure validation.

- [ ] **Step 3: Review git diff for migration completeness**

Run: inspect changed workflow docs and skills.
Expected: the new structure is internally consistent and no required workflow file is missing.
