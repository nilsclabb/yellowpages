# State Management

- [Decision Tree](#decision-tree)
- [Zustand: Global Singletons Only](#zustand-global-singletons-only)
- [Convex Reactive Queries: The Default](#convex-reactive-queries-the-default)
- [TanStack Query: External APIs Only](#tanstack-query-external-apis-only)

## Decision Tree

```
Is this backend entity data?
├── Yes → Is it from Convex?
│   ├── Yes → Convex reactive query (useQuery)
│   └── No  → TanStack Query (useQuery + queryClient)
└── No  → Is it global across the app?
    ├── Yes → Zustand store
    └── No  → Component useState
```

## Zustand: Global Singletons Only

Zustand stores hold **app-wide client state** — never server/entity data.

```typescript
// stores/authStore.ts
import { create } from "zustand"

interface AuthState {
  user: User | null
  organizationId: string | null
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  organizationId: null,
  setUser: (user) => set({ user, organizationId: user?.organizationId ?? null }),
}))
```

**Existing stores:**

| Store | Holds |
|---|---|
| `useAuthStore` | Current user, organizationId |
| `useToastStore` | Toast queue (message, type, dismiss) |
| `useThemeStore` | Light/dark preference |
| `useLocaleStore` | Active locale for i18n |

**Rules:**
- No providers needed — Zustand stores are module singletons
- Use selectors to avoid unnecessary re-renders: `useAuthStore(s => s.user)`
- Never put entity data (consultants, missions) in Zustand

## Convex Reactive Queries: The Default

For any data that lives in Convex, use `useQuery` from `convex/react`. It subscribes to real-time updates automatically.

```typescript
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/api"

const consultants = useQuery(
  api.consultants.list,
  organizationId ? { organizationId } : "skip"
)
// Returns: Doc[] | undefined (undefined = still loading)
```

**The `"skip"` pattern:** Pass `"skip"` as the second argument to prevent the query from firing until dependencies are ready.

## TanStack Query: External APIs Only

Only use TanStack Query for data NOT in Convex:

```typescript
import { useQuery } from "@tanstack/react-query"

export function useExternalJobBoard(params: SearchParams) {
  return useQuery({
    queryKey: ["jobBoard", params],
    queryFn: () => fetchJobBoard(params),
    staleTime: 5 * 60 * 1000,
  })
}
```

**Never use TanStack Query for Convex data** — it duplicates Convex's built-in reactivity and caching.
