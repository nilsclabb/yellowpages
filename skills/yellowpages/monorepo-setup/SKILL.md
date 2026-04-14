---
name: monorepo-setup
description: >
  Workspace structure, shared package conventions, build pipeline, and deployment
  configuration for Bun + Turborepo + Convex + Vercel monorepos. Use when:
  setting up a new project, configuring workspaces, adding a shared package,
  setting up build scripts, configuring Vercel deployment, managing environment
  variables, configuring TypeScript paths, or setting up Vite plugins.
command: /monorepo-setup
---

# Monorepo Setup

Conventions for Bun + Turborepo monorepo structure, shared packages, build pipeline, and deployment. This skill covers everything outside application code — the scaffolding that makes the stack work together.

## Workspace Overview

```
project-root/
├── apps/web/              # Vite SPA frontend
├── convex/                # Convex backend (NOT a workspace — Convex manages it)
├── packages/shared/       # Zod schemas, types, roles, CASL permissions
├── packages/ui/           # Component library (Radix + Tailwind + CVA)
├── turbo.json             # Task orchestration
├── package.json           # Workspace root
└── vercel.json            # Deployment config
```

**Note:** `convex/` is NOT a Bun workspace — it has its own dependency management via the Convex CLI.

## Reference Map

| When you need to... | Read |
|---|---|
| Understand workspace layout or add a shared package | [references/workspace-structure.md](references/workspace-structure.md) |
| Configure build scripts, Vercel deploy, or env vars | [references/build-deploy.md](references/build-deploy.md) |
| Set up TypeScript paths, Vite plugins, or Tailwind v4 | [references/tooling-config.md](references/tooling-config.md) |
