# Workspace Structure

- [Root package.json](#root-packagejson)
- [Shared Package: @workspace/shared](#shared-package-workspaceshared)
- [UI Package: @workspace/ui](#ui-package-workspaceui)
- [Adding a New Package](#adding-a-new-package)

## Root package.json

```json
{
  "name": "project-root",
  "private": true,
  "workspaces": ["apps/*", "packages/*"]
}
```

## Shared Package: `@workspace/shared`

Holds everything that both frontend and backend import — schemas, types, roles, permissions.

```
packages/shared/
├── src/
│   ├── schemas/          # Zod validators (consultant.ts, mission.ts)
│   ├── types/            # TypeScript interfaces
│   ├── roles/            # Role hierarchy, hasMinRole(), defineAbilitiesFor()
│   └── api-types/        # Request/response interfaces for external APIs
├── package.json
└── tsconfig.json
```

**Exports:**

```json
{
  "name": "@workspace/shared",
  "exports": {
    ".": "./src/index.ts",
    "./schemas": "./src/schemas/index.ts",
    "./roles": "./src/roles/index.ts",
    "./api-types": "./src/api-types/index.ts"
  }
}
```

**Import examples:**

```typescript
import { consultantSchema } from "@workspace/shared/schemas"
import { hasMinRole, defineAbilitiesFor } from "@workspace/shared/roles"
import type { ConsultantInput } from "@workspace/shared"
```

## UI Package: `@workspace/ui`

The component library. See the `ui-component-system` skill for usage patterns.

```
packages/ui/
├── src/
│   ├── components/       # Button.tsx, Card.tsx, Input.tsx, ...
│   ├── styles/           # CSS entry point (Tailwind vars + semantic colors)
│   └── utils.ts          # cn() helper
├── package.json
└── tsconfig.json
```

**Exports:**

```json
{
  "name": "@workspace/ui",
  "exports": {
    ".": "./src/index.ts",
    "./utils": "./src/utils.ts",
    "./styles": "./src/styles/index.css"
  }
}
```

## Adding a New Package

1. Create `packages/<name>/` with `package.json` (name: `@workspace/<name>`)
2. Add `"exports"` map in `package.json`
3. Add TypeScript path alias to root `tsconfig.json`
4. Import in consuming workspaces — Bun resolves it automatically
