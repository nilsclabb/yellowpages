# Data Fetching & Mutation Patterns

- [Query Hook Pattern](#query-hook-pattern)
- [Mutation Pattern](#mutation-pattern)
- [Permission Checking (Frontend)](#permission-checking-frontend)
- [Component Naming Summary](#component-naming-summary)

## Query Hook Pattern

Wrap Convex queries in custom hooks for consistent loading/error handling:

```typescript
// queries/useConsultants.ts
import { useQuery } from "convex/react"
import { api } from "@workspace/backend/api"
import { useAuthStore } from "@/stores/authStore"

export function useConsultants() {
  const organizationId = useAuthStore((s) => s.organizationId)
  const consultants = useQuery(
    api.consultants.list,
    organizationId ? { organizationId } : "skip"
  )
  return { data: consultants ?? [], isLoading: consultants === undefined }
}
```

## Mutation Pattern

Every mutation has try/catch with toast feedback. Errors never bubble silently.

```typescript
// queries/useUpdateConsultant.ts
import { useMutation } from "convex/react"
import { api } from "@workspace/backend/api"
import { useToastStore } from "@/stores/toastStore"

export function useUpdateConsultant() {
  const updateMutation = useMutation(api.consultants.update)
  const addToast = useToastStore((s) => s.addToast)

  return async (id: string, data: ConsultantInput) => {
    try {
      await updateMutation({ id, data })
      addToast("Consultant updated", "success")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update failed"
      addToast(message, "error")
    }
  }
}
```

**Rules:**
- Always try/catch — no unhandled rejections
- Success → `addToast("...", "success")`
- Error → `addToast(error.message, "error")`
- Return the async function from the hook, not the raw mutation

## Permission Checking (Frontend)

CASL abilities from the shared package, exposed via `useCan` hook:

```typescript
// lib/useCan.ts
import { useAuthStore } from "@/stores/authStore"
import { defineAbilitiesFor } from "@workspace/shared/roles"

export function useCan() {
  const user = useAuthStore((s) => s.user)
  const ability = defineAbilitiesFor(user?.role ?? "guest")
  return (action: string, subject: string) => ability.can(action, subject)
}
```

Usage in components:

```typescript
function SettingsPage() {
  const can = useCan()

  if (!can("read", "Setting")) {
    return <NoAccess />
  }

  return <SettingsForm canEdit={can("update", "Setting")} />
}
```

## Component Naming Summary

| Type | Pattern | Example |
|---|---|---|
| Page component | `{Entity}List`, `{Entity}Detail` | `ConsultantList`, `MissionDetail` |
| Form component | `{Entity}Form` | `ConsultantForm` |
| Card component | `{Entity}Card` | `MissionCard` |
| Query hook | `use{Entity}` or `use{Entities}` | `useConsultant`, `useConsultants` |
| Mutation hook | `use{Action}{Entity}` | `useUpdateConsultant`, `useCreateMission` |
