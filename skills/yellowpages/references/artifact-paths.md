# Artifact Output Paths

This file defines the standard output locations for workflow artifacts — so skills can chain outputs into the next skill's inputs without manual copy-paste.

## The Core Idea

Each workflow step that produces an artifact writes to a **known path**. The next step reads from that path. The filesystem is the handoff layer, not instructions.

## Standard Directory

```
.agents/state/<workflow-name>/
├── latest-output.md          ← the artifact the next step/skill reads
├── history/
│   └── YYYY-MM-DD-HH-MM.md  ← timestamped previous runs
└── gates.json                ← which gates have passed for this workflow
```

## Artifact Path by Workflow

| Workflow | Writes to | Next consumer reads |
|---|---|---|
| `create-skill` | `.agents/state/create-skill/latest-output.md` | `step-04-verify.md` |
| Any workflow producing a plan | `.agents/state/<name>/latest-output.md` | Next step or checklist |

## How Steps Should Write

At the end of any step that produces a document artifact:

```markdown
## Output

Write the result to: `.agents/state/<workflow-name>/latest-output.md`
Also append a timestamped copy to: `.agents/state/<workflow-name>/history/`
```

## How Steps Should Read

At the start of any step that consumes a prior step's output:

```markdown
Context: Read `.agents/state/<workflow-name>/latest-output.md`
```

If that file does not exist, the step must stop and ask the user to run the preceding step first.

## Gates File Schema

```json
{
  "workflow": "create-skill",
  "lastRun": "2025-04-11T14:00:00",
  "gates": {
    "understand": "passed",
    "plan": "passed",
    "build": "in-progress",
    "verify": "pending"
  }
}
```

Written to `.agents/state/<workflow-name>/gates.json` by the verify step.
