# Brainstorm — Interview Protocol

## Scope Triage (do this first)

Before asking detail questions, decide whether the request is right-sized for a single spec.

**Red flags that signal the scope is too large:**
- Describes multiple independent subsystems (e.g. "build a platform with chat, billing, and analytics")
- Uses plural nouns where each noun is its own product ("dashboards", "integrations", "roles")
- Timeline implies weeks of work

**If scope is too large:** name the independent pieces, propose an order, pick the first one, and run the interview on that piece only. Each sub-project gets its own spec → plan → implementation cycle.

## Question Style

- **One question per message.** Never batch.
- **Multiple choice preferred** over open-ended. Offer 2–4 concrete options and label them A/B/C/D.
- **Lead with your recommendation** when proposing approaches — then explain the trade-offs.
- **Focus on decisions, not trivia.** Skip questions whose answer does not affect the design.

## Question Order

Work top-down:

1. **Purpose** — what problem does this solve, for whom, why now?
2. **Success criteria** — how will we know it worked? What does "done" look like?
3. **Constraints** — stack, budget, deadline, compatibility, security, team skills
4. **Approach choice** — present 2–3 viable approaches, recommend one, confirm
5. **Scope edges** — what is explicitly out of scope (non-goals)
6. **Risks** — what could go wrong, what assumptions are we making

Stop once you have enough to propose a design. If answers surface a new major unknown, add a question — don't barrel past it.

## Proposing Approaches

After enough context, present 2–3 options in a short comparison:

- **Option A (recommended):** one-sentence summary, key trade-offs
- **Option B:** one-sentence summary, key trade-offs
- **Option C:** one-sentence summary, key trade-offs (optional)

Ask the user to pick or suggest a hybrid. Don't proceed without an explicit choice.

## Presenting the Design

Once the approach is picked, present the design in sections scaled to their complexity:

- **Architecture** — how the pieces fit together (a few sentences to a diagram)
- **Components** — each unit, its responsibility, its interface
- **Data flow** — what moves where, in what format
- **Error handling** — failure modes and recovery
- **Testing** — how we'll verify it works

Confirm each section before moving on. If something doesn't make sense, loop back to clarifying questions.

## Working in Existing Codebases

- Explore existing structure before proposing changes. Follow established patterns.
- If existing code has problems that affect this work (a file that's grown too large, unclear boundaries), include targeted improvements in the design — the way a good developer improves code they're working in.
- Do not propose unrelated refactoring. Stay focused on what serves the current goal.
