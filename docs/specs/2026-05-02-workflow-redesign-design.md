# Workflow Redesign — Design Spec

_Author: Nils Claesson_ · _Date: 2026-05-02_ · _Status: approved_

## Problem

Yellowpages already has a useful software-building workflow, but the current shape is a transitional mix of stage skills and older naming. `yp-brainstorm`, `yp-auto-plan`, `yp-tasks`, `yp-verify`, and `pr-code-review` capture important behaviors, yet the overall system is still framed more as a set of individual tools than as a coherent, lightweight software-development methodology.

The repo is also trying to solve a different problem than Superpowers: preserve strong agent behavior without paying the token cost of large always-relevant skills. Superpowers is operationally strong but expensive to load repeatedly. Karpathy's guidelines are compact and behaviorally sharp, but too abstract on their own for end-to-end software execution. Yellowpages needs a new workflow architecture that keeps the runtime core tiny, expands on demand, and cleanly separates required workflow behavior from optional high-value tactics like subagents, worktrees, debugging, and review loops.

## Goal

Create a new Yellowpages software-building workflow that is tiny by default, strong in required agent behavior, and able to discover richer optional capabilities on demand.

## Non-Goals

- Reproducing Superpowers wholesale inside Yellowpages
- Keeping the current five workflow skills as fixed architectural boundaries
- Loading a large always-on doctrine file at session start
- Physically nesting skill directories in ways that break native discovery or install surfaces
- Redesigning non-workflow routers such as `yp-skill-system` or `yp-session-tools`
- Implementing every possible optional capability in the first pass
- Changing the runtime bootstrap model away from `using-yellowpages`

## Approach

Adopt a hybrid redesign from scratch: a compact workflow router, a new six-stage core workflow, and a shared optional capability library. The new system borrows Karpathy's strongest behavioral defaults, such as clarity, simplicity, surgical changes, and goal-driven verification, while borrowing Superpowers' strongest operational ideas, such as staged progress, explicit gates, optional subagent tactics, and review discipline.

Alternatives considered:

- Keep the existing five-stage workflow and only rewrite the copy. Rejected because the current boundaries are part of the problem, especially `yp-tasks` as a stage name and `yp-brainstorm` as too narrow a framing.
- Go principle-first with minimal workflow structure. Rejected because it risks becoming too abstract for real coding sessions.
- Go capability-first with no clear default software path. Rejected because it weakens routing clarity and makes the workflow feel less coherent.

## Architecture

The new workflow system has three layers:

```text
using-yellowpages
  -> yp-workflow
    -> core workflow stage
      -> optional capability skill/reference (only if needed)
```

### Layer 1: Runtime entry

`using-yellowpages` remains the only injected bootstrap skill. For normal software-engineering work it routes to `yp-workflow`, which stays small and focuses on selecting the correct core workflow stage.

### Layer 2: Core workflow stages

The current workflow skill set is replaced by a new lifecycle:

1. `frame-work`
2. `design-work`
3. `plan-work`
4. `execute-work`
5. `verify-work`
6. `review-work`

These are the default software-building stages. Each stage skill defines:

- the purpose of the stage
- required agent behavior
- stop/ask rules
- stage exit criteria
- the next routing step
- short pointers to optional capabilities that may help

Each stage remains compact. Deep explanations and tactics live elsewhere.

### Layer 3: Optional capability library

Optional capabilities are shared once and discovered when useful. They do not become alternate workflow routers.

Representative capabilities for the first redesign:

- subagent orchestration
- parallel agent dispatch
- git worktrees
- TDD and regression discipline
- systematic debugging
- review loops
- handoffs and progress reporting

### Logical tree, not physical nesting

The workflow should feel like a staged tree with optional sub-branches, but the filesystem layout should stay Yellowpages-compliant and discovery-friendly. That means the "subskill tree" is logical, expressed through naming and routing, not through deeply nested skill directories.

Recommended layout shape:

```text
skills/yellowpages/
  yp-workflow/
  yp-workflow-frame/
  yp-workflow-design/
  yp-workflow-plan/
  yp-workflow-execute/
  yp-workflow-verify/
  yp-workflow-review/
  yp-workflow-subagents/
  yp-workflow-parallel-agents/
  yp-workflow-git-worktrees/
  yp-workflow-tdd/
  yp-workflow-debugging/
  yp-workflow-review-loops/
  yp-workflow-handoffs/
```

This preserves native install/discovery assumptions, keeps top-level skill symlink generation straightforward, and still creates a coherent logical subtree around `yp-workflow`.

## Components

### `yp-workflow`

Primary router for software-building work. Routes to the correct core stage and explains the high-level lifecycle in minimal form.

### Core stage skills

- `yp-workflow-frame`: clarify the request, surface assumptions, define success criteria, classify complexity
- `yp-workflow-design`: compare approaches, recommend the simplest sufficient design, define boundaries and non-goals
- `yp-workflow-plan`: turn an approved design into a concrete implementation plan with verification strategy
- `yp-workflow-execute`: carry out the plan or explicit user direction with minimal, surgical changes
- `yp-workflow-verify`: require fresh evidence before any completion claim
- `yp-workflow-review`: inspect correctness, risk, readiness, and external review feedback

### Optional capability skills

- `yp-workflow-subagents`: when and how to delegate to focused subagents
- `yp-workflow-parallel-agents`: when multiple agents can safely work in parallel
- `yp-workflow-git-worktrees`: isolated worktree usage, merge-back expectations, cleanup
- `yp-workflow-tdd`: test-first and regression-proof execution patterns
- `yp-workflow-debugging`: systematic debugging and root-cause-first investigation
- `yp-workflow-review-loops`: lightweight quality gates before moving between stages
- `yp-workflow-handoffs`: how agents report progress, blockers, and completion state cleanly

### Legacy workflow migration

The current workflow skills are migrated as follows:

- `yp-brainstorm` -> replaced by `yp-workflow-frame` and `yp-workflow-design`
- `yp-auto-plan` -> replaced by `yp-workflow-plan`
- `yp-tasks` -> narrowed or retired as a primary workflow stage; any remaining task-coordination behavior becomes subordinate to `execute-work`
- `yp-verify` -> migrated into `yp-workflow-verify`
- `pr-code-review` -> migrated into `yp-workflow-review` or retained as a focused specialized review leaf routed from it

Backward-compatible routing should be preserved for one release cycle through compatibility shims so existing references, commands, or habits do not fail abruptly.

### Reinstall handoff artifact

The implementation must also produce a reusable operator prompt for another agent that can wipe existing Yellowpages install surfaces on the local machine and reinstall the updated library cleanly. This prompt should cover:

- which install surfaces to remove or replace
- how to re-link or re-install the updated skill library
- how to restore session-start bootstrap integration
- how to verify discovery and runtime bootstrap after reinstall

## Data Flow

### Runtime routing

1. Session start injects `using-yellowpages`
2. Coding/building requests route to `yp-workflow`
3. `yp-workflow` selects the appropriate core stage
4. The core stage skill either handles the current need directly or points to one or more optional capabilities
5. Optional capability skills may point to short reference files when deeper explanation is required

### Decision flow inside a stage

Each core stage should expose three kinds of information:

- `required`: what the agent should normally do in this stage
- `optional`: extra tactics that may help when circumstances warrant
- `user override`: the user can redirect, skip, or narrow the process explicitly

### Capability reuse

Optional capabilities are shared across stages. For example:

- `frame-work` may point to `subagents` or `handoffs`
- `plan-work` may point to `parallel-agents`, `git-worktrees`, or `tdd`
- `execute-work` may point to `subagents`, `git-worktrees`, `tdd`, or `debugging`
- `verify-work` may point to `tdd` or `review-loops`
- `review-work` may point to `review-loops` or `handoffs`

This avoids duplicated capability content while keeping direct stage-to-capability links available.

## Error Handling

### Routing failures

- If a request could fit multiple stages, `yp-workflow` should route to the earliest meaningful stage rather than silently skipping ahead.
- If a user explicitly opts out of a stage, the skill should obey and route forward with that constraint made explicit.

### Overload failures

- Core stage skills must not absorb detailed optional guidance just because it feels useful.
- Capability content must not be duplicated across multiple stage skills.
- Optional capability skills must not grow into alternate workflow routers.

### Migration failures

- Existing references to old workflow skills should be redirected or preserved with compatibility notes during transition.
- `INDEX.md`, bootstrap references, and install surfaces must stay coherent while old and new names coexist.

### Install and discovery failures

- The redesign must preserve top-level discoverability for hosts that do not recurse automatically.
- If reinstall is partial or stale, the verification instructions should clearly detect missing symlinks, wrong targets, or outdated hook configuration.

## Testing Strategy

Verification should cover architecture, routing, and installability.

### Static checks

- Ensure every new `SKILL.md` stays within Yellowpages budget
- Ensure every new reference file stays within budget
- Ensure every stage-to-capability link states when to load the capability
- Ensure `INDEX.md` reflects the new workflow structure clearly

### Behavioral checks

- Confirm `using-yellowpages` still routes normal software work into `yp-workflow`
- Confirm `yp-workflow` routes representative requests into the correct new stage
- Confirm core stage skills remain small and link to optional capabilities instead of embedding them
- Confirm optional capabilities can be discovered without preloading the whole workflow library

### Install checks

- Verify local install surfaces can discover the new stage and capability skills
- Verify top-level symlink generation still exposes leaf skills for hosts with shallow discovery
- Verify SessionStart still injects only `using-yellowpages`

### Migration checks

- Verify any retained legacy skills either route correctly or clearly instruct the agent to use the new stage skill
- Verify existing workflow commands or references do not strand the agent on removed names

### Manual review

- Inspect the resulting workflow as a human-readable methodology: the default path should be obvious, optional tactics should be discoverable, and the runtime core should remain lean
- Validate the reinstall prompt on a real machine or by dry-running the steps against the known install surfaces

## Success Criteria

- Normal software-building requests route through a clear six-stage workflow: frame, design, plan, execute, verify, review
- The runtime bootstrap remains lean: only `using-yellowpages` is injected at session start
- `yp-workflow` remains compact and acts as a router, not a doctrine dump
- Each core stage skill is compact and operational, with explicit required behavior and direct optional capability pointers
- Optional workflow tactics exist as reusable shared capabilities rather than duplicated per-stage content
- The strongest Karpathy ideas are embedded in the workflow defaults without requiring a large standalone always-loaded skill
- The strongest Superpowers ideas are available on demand without forcing large skills into routine coding sessions
- Install surfaces and skill discovery continue to work after the redesign
- A reusable agent prompt exists for wiping and reinstalling the updated Yellowpages library on the local machine

## Open Questions

None for v1. The approved design locks these decisions:

- use the `yp-workflow-<stage>` naming pattern for the new core stages
- keep legacy workflow skills as compatibility shims for one release cycle
- keep `yp-tasks` as a narrower execution helper rather than a primary workflow stage
- keep `pr-code-review` as a specialized review leaf aligned with `yp-workflow-review`
