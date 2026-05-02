---
name: yp-workflow-subagents
description: Use when focused delegation to one or more subagents would improve software work without bloating the main session context.
---

# Workflow Capability: Subagents

Delegate when focused work benefits from isolated context, specialized prompts, or clean reporting.

## Use When

- a bounded task can be described clearly
- the main session should stay focused on coordination
- a reviewer, implementer, or researcher role helps

## Avoid When

- the task is tiny
- the work needs constant shared-state editing
- the prompt would be vague or underspecified

## Required Pattern

- give the subagent a narrow scope
- include the exact goal, constraints, and expected return format
- verify the result independently before trusting it

## Often Useful In

`yp-workflow-frame`, `yp-workflow-design`, `yp-workflow-execute`
