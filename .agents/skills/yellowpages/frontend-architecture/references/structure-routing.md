# Project Structure & Routing

## Directory Layout

```
apps/web/src/
├── components/           # Feature-based directories
│   ├── consultants/      #   ConsultantForm.tsx, ConsultantCard.tsx
│   ├── missions/         #   MissionList.tsx, MissionDetail.tsx
│   └── shared/           #   Layout.tsx, ErrorBoundary.tsx
├── lib/                  # Utilities (api.ts, convex.ts, useCan.ts)
├── queries/              # TanStack Query + Convex hook wrappers
├── routes/               # TanStack Router file-based pages
├── stores/               # Zustand stores (authStore, toastStore, themeStore)
└── main.tsx              # Root: auth provider + Convex provider setup
```

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Component files | PascalCase | `ConsultantForm.tsx`, `MissionCard.tsx` |
| Feature directories | lowercase plural | `components/consultants/`, `components/missions/` |
| Hooks | `use` prefix | `useConsultants`, `useUpdateMission` |
| Stores | `Store` suffix | `useAuthStore`, `useToastStore` |
| Query wrappers | `use` + entity | `useConsultants`, `useMission` |

## TanStack Router Conventions

File-based routing with auto code-splitting:

```
routes/
├── __root.tsx                        # Root layout (providers, error boundary)
├── index.tsx                         # Landing / redirect
├── dashboard.tsx                     # Authenticated layout (sidebar, nav)
├── dashboard/
│   ├── index.tsx                     # Dashboard home
│   ├── consultants/
│   │   ├── index.tsx                 # List page
│   │   ├── $id.tsx                   # Detail page
│   │   ├── new.tsx                   # Create page
│   │   └── $id.edit.tsx              # Edit page
│   └── missions/
│       ├── index.tsx                 # List page
│       └── $id.tsx                   # Detail page
└── login.tsx                         # Public login page
```

**Route patterns:**
- `/feature` → list view (`index.tsx`)
- `/feature/$id` → detail view (`$id.tsx`)
- `/feature/new` → create form (`new.tsx`)
- `/feature/$id/edit` → edit form (`$id.edit.tsx`)

## Route File Structure

```typescript
// routes/dashboard/consultants/index.tsx
import { createFileRoute } from "@tanstack/react-router"
import { ConsultantList } from "@/components/consultants/ConsultantList"

export const Route = createFileRoute("/dashboard/consultants/")({
  component: ConsultantList,
})
```
