# Error Handling & Validation

- [ConvexError](#convexerror)
- [Frontend Error Flow](#frontend-error-flow)
- [Zod Validation](#zod-validation)
- [Backend Validation Helper](#backend-validation-helper)
- [Usage in Mutations](#usage-in-mutations)

## ConvexError

Always throw `ConvexError` — never plain `Error`. ConvexError propagates structured data to the frontend.

```typescript
import { ConvexError } from "convex/values"

throw new ConvexError("Consultant not found")
throw new ConvexError({
  code: "FORBIDDEN",
  message: "You do not have permission to update this consultant",
})
throw new ConvexError({
  code: "VALIDATION_ERROR",
  message: "Invalid email format",
  field: "email",
})
```

## Frontend Error Flow

Errors thrown as `ConvexError` surface automatically through Convex hooks and TanStack Query:

1. Backend throws `ConvexError`
2. Frontend mutation hook catches it
3. Custom hook displays toast via `addToast(error.message, "error")`
4. **Never let errors bubble silently** — every mutation call has try/catch

## Zod Validation

Zod schemas live in the shared package (`@workspace/shared/schemas`). The same schema validates on both frontend (forms) and backend (mutations).

```typescript
// packages/shared/src/schemas/consultant.ts
import { z } from "zod"

export const consultantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  status: z.enum(["active", "archived", "pending"]),
  skills: z.array(z.string()).min(1, "At least one skill required"),
})

export type ConsultantInput = z.infer<typeof consultantSchema>
```

## Backend Validation Helper

Wrap Zod parse in a helper that throws `ConvexError` on failure:

```typescript
// convex/lib/validation.ts
import { ConvexError } from "convex/values"
import type { ZodSchema } from "zod"

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const firstError = result.error.errors[0]
    throw new ConvexError({
      code: "VALIDATION_ERROR",
      message: firstError.message,
      field: firstError.path.join("."),
    })
  }
  return result.data
}
```

## Usage in Mutations

```typescript
import { consultantSchema } from "@workspace/shared/schemas"
import { validate } from "./lib/validation"

export const create = mutation({
  args: { data: v.any() },
  handler: async (ctx, args) => {
    const user = await requireOrganizationAccess(ctx, args.data.organizationId)
    requirePermission(user, "create", "Consultant")

    const validated = validate(consultantSchema, args.data)
    return ctx.db.insert("consultants", {
      ...validated,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  },
})
```
