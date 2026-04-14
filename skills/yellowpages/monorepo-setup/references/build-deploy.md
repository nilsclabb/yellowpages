# Build Pipeline & Deployment

## Dev Scripts

```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "convex deploy --yes && turbo run build",
    "typecheck": "turbo run typecheck",
    "lint": "turbo run lint"
  }
}
```

`bun dev` runs all workspaces in parallel via Turborepo + Convex dev server.

## turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "dev": {
      "cache": false,
      "persistent": true
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "lint": {}
  }
}
```

**Key behaviors:**
- `dev` is persistent (long-running) and never cached
- `build` depends on workspace dependencies building first (`^build`)
- `typecheck` cascades through the dependency graph

## Vercel Deployment

```json
// vercel.json
{
  "buildCommand": "npx convex deploy --yes && turbo run build",
  "outputDirectory": "apps/web/dist",
  "framework": "vite"
}
```

**Deploy sequence:**
1. Convex deploys backend functions + schema first
2. Turborepo builds all workspaces (shared → ui → web)
3. Vercel serves `apps/web/dist` as static SPA

## Environment Variables

| Context | Where to set | Prefix rule |
|---|---|---|
| Convex backend | Convex Dashboard (Settings → Environment Variables) | None — accessed via `process.env` |
| Vite frontend | `.env.local` or Vercel env vars | Must use `VITE_` prefix |
| Build-time only | Vercel env vars | No prefix needed |

**Rules:**
- Never commit `.env` files — they are gitignored
- Backend secrets (API keys, tokens) go in Convex Dashboard only
- Frontend vars are public by design — never put secrets in `VITE_` vars
- Use `.env.example` to document required variables (values blank)
