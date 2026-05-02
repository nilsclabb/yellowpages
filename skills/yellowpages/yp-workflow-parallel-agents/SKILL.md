---
name: yp-workflow-parallel-agents
description: Use when multiple independent software tasks or investigations can be delegated safely in parallel.
---

# Workflow Capability: Parallel Agents

Run work in parallel only when the tasks are truly independent.

## Use When

- tasks touch different files or subsystems
- outputs do not feed into each other
- shared state and edit conflicts are unlikely

## Avoid When

- one fix may change the others
- tasks depend on sequential discoveries
- agents would edit the same files

## Required Pattern

- split work by independent domain
- give each agent a focused prompt
- integrate and verify results together afterward

## Often Useful In

`yp-workflow-plan`, `yp-workflow-execute`
