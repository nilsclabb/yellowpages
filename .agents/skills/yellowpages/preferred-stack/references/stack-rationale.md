# Stack Rationale

Why each layer is chosen. Read when evaluating alternatives or explaining a decision.

## Runtime & Tooling

| Choice | Why |
|---|---|
| **Bun** | Native TypeScript execution, fast install/test/run, drop-in npm compatibility |
| **Turborepo** | Workspace-aware task graph, remote caching, no config for common cases |

## Backend

| Choice | Why |
|---|---|
| **Convex** | Serverless with real-time subscriptions, transactional mutations, zero infra management, automatic caching and reactivity |
| **Zod (shared)** | Single source of truth for validation — same schemas on frontend and backend |

## Frontend

| Choice | Why |
|---|---|
| **React 19** | Suspense-ready, largest ecosystem, stable concurrent features |
| **Vite SPA** | Fast HMR, native ESM, simple config, plugin ecosystem |
| **TanStack Router** | File-based routing, fully type-safe params/search, auto code-splitting |
| **TanStack Query** | Used only for non-Convex external APIs — caching, retries, pagination |
| **Zustand** | Minimal boilerplate, selector-based reactivity, no providers needed |

## UI & Styling

| Choice | Why |
|---|---|
| **Tailwind CSS v4** | Utility-first, CSS variables for theming, native Vite plugin (no PostCSS) |
| **Radix UI** | Accessible headless primitives, unstyled, composable with any design system |
| **CVA** | Type-safe variant API, pairs naturally with Tailwind class strings |

## Auth & Permissions

| Choice | Why |
|---|---|
| **WorkOS** | Enterprise SSO/SAML when clients require it |
| **Convex Auth** | Simpler cases — built-in, no external service |
| **CASL** | Isomorphic ability-based permissions, works identically frontend + backend |

## AI/ML

| Choice | Why |
|---|---|
| **Google Vertex AI / Gemini** | Embeddings, text generation, structured output, good cost/performance ratio |

## Deployment

| Choice | Why |
|---|---|
| **Vercel** | Zero-config SPA hosting, preview deploys, edge network |
| **Convex Cloud** | Managed serverless backend, automatic scaling, integrated with Convex dev workflow |

## i18n

| Choice | Why |
|---|---|
| **Paraglide.js (Inlang)** | Type-safe message extraction, tiny runtime, compile-time optimization |
