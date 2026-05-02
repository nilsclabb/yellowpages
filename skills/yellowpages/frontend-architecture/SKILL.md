---
name: frontend-architecture
description: >
  Conventions for React app structure, TanStack Router file-based routing,
  state management separation (Zustand vs Convex vs TanStack Query), data
  fetching patterns, and component organization. Use when: building React
  pages, adding routes, choosing where to put state, wiring up data fetching,
  creating mutation hooks, checking permissions on the frontend, or organizing
  components by feature.
---

# Frontend Architecture

React/Vite app conventions for routing, state, and data fetching. The core rule: **state has three homes, and picking the wrong one causes bugs.**

## The State Separation Rule

| State type | Tool | Example |
|---|---|---|
| Global singletons | Zustand store | auth, toasts, theme, locale |
| Backend entity data | Convex reactive queries | consultants, missions, applications |
| External API data | TanStack Query | third-party APIs, non-Convex services |
| Local UI state | `useState` | open/closed, form draft, hover |

**Convex reactive queries are the DEFAULT for backend data.** TanStack Query is only for non-Convex external calls.

## Reference Map

| When you need to... | Read |
|---|---|
| Understand project structure or add a new route | [references/structure-routing.md](references/structure-routing.md) |
| Decide where state belongs (Zustand vs Convex vs TanStack Query) | [references/state-management.md](references/state-management.md) |
| Write data fetching hooks, mutation handlers, or permission checks | [references/data-patterns.md](references/data-patterns.md) |
