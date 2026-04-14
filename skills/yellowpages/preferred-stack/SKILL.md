---
name: preferred-stack
description: >
  Defines the preferred technology stack, architectural choices, and tooling for
  all new projects. Routes to domain-specific skills for backend, frontend, UI,
  and monorepo conventions. Use when: choosing a tech stack, starting a new project,
  making an architectural decision, selecting a library or framework, asking "what
  should I use for X", or needing an overview of preferred tooling.
command: /preferred-stack
---

# Preferred Stack

The canonical tech stack and architectural choices for all new projects. This is a routing skill — it tells you what is chosen and points you to the skill that explains how to use it.

## Stack Overview

| Layer | Choice |
|---|---|
| Package manager | Bun |
| Monorepo orchestration | Turborepo |
| Backend | Convex |
| Frontend framework | React 19 (Vite SPA) |
| Routing | TanStack Router |
| Server state | TanStack Query (non-Convex) + Convex reactive queries |
| Client state | Zustand |
| Styling | Tailwind CSS v4 |
| Component primitives | Radix UI (headless) |
| Component variants | class-variance-authority (CVA) |
| Validation | Zod (shared frontend + backend) |
| Auth | WorkOS (SSO/SAML) or Convex Auth |
| Permissions | CASL (isomorphic) |
| AI/ML | Google Vertex AI / Gemini |
| Deployment | Vercel (frontend) + Convex Cloud (backend) |
| i18n | Paraglide.js (Inlang) |

## Reference Map

| When you need to... | Read |
|---|---|
| Understand *why* each layer was chosen | [references/stack-rationale.md](references/stack-rationale.md) |
| Write Convex functions, schema, or backend logic | [../convex-patterns/SKILL.md](../convex-patterns/SKILL.md) |
| Build React pages, routing, state, or data fetching | [../frontend-architecture/SKILL.md](../frontend-architecture/SKILL.md) |
| Create or style UI components in the design system | [../ui-component-system/SKILL.md](../ui-component-system/SKILL.md) |
| Set up workspaces, build pipeline, or deployment | [../monorepo-setup/SKILL.md](../monorepo-setup/SKILL.md) |
