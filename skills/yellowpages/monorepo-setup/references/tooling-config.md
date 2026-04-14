# Tooling Configuration

- [TypeScript](#typescript)
- [Vite Configuration](#vite-configuration)
- [Tailwind CSS v4](#tailwind-css-v4)
- [Paraglide.js (i18n)](#paraglidejs-i18n)

## TypeScript

Root `tsconfig.json` with path aliases:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./apps/web/src/*"],
      "@workspace/shared": ["./packages/shared/src"],
      "@workspace/shared/*": ["./packages/shared/src/*"],
      "@workspace/ui": ["./packages/ui/src"],
      "@workspace/ui/*": ["./packages/ui/src/*"]
    }
  }
}
```

**Path alias rule:** `@/` always resolves to `apps/web/src/`. Workspace packages use `@workspace/` prefix.

## Vite Configuration

```typescript
// apps/web/vite.config.ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import { paraglide } from "@inlang/paraglide-vite"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),                              // Tailwind v4 — native Vite plugin, NOT PostCSS
    TanStackRouterVite(),                       // Auto code-splitting + route generation
    paraglide({ project: "./project.inlang" }), // i18n compile-time optimization
  ],
  resolve: {
    dedupe: ["react", "react-dom"],             // Prevent duplicate React in workspace
  },
})
```

**Key notes:**
- Tailwind CSS v4 uses its native Vite plugin — **not** the PostCSS plugin
- TanStack Router plugin generates route types and enables auto code-splitting
- `resolve.dedupe` prevents multiple React instances when packages import React

## Tailwind CSS v4

Tailwind v4 uses CSS-first configuration:

```css
/* apps/web/src/styles/app.css */
@import "tailwindcss";
@import "@workspace/ui/styles";   /* Semantic color tokens */

@theme {
  --color-brand-violet: #7c3aed;
  --color-brand-peach: #fb923c;
}
```

**Differences from v3:**
- No `tailwind.config.js` — configuration lives in CSS via `@theme`
- No PostCSS setup — uses native Vite plugin
- `@import "tailwindcss"` replaces `@tailwind base/components/utilities`
- Custom colors defined in `@theme` block, not a JS config file

## Paraglide.js (i18n)

```
project.inlang/
├── settings.json           # Language config + plugin references
└── messages/
    ├── en.json             # Source messages
    └── sv.json             # Swedish translations
```

Messages are type-safe and tree-shaken at build time:

```typescript
import * as m from "@/paraglide/messages"

<h1>{m.dashboard_title()}</h1>   // Type-safe, auto-extracted
```
