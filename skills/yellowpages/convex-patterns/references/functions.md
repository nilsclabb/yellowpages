# Function Organization & Naming

## File Organization

One file per domain entity. Queries and mutations in the main file, Node.js actions in a separate file.

```
convex/
├── consultants.ts            ← queries + mutations (V8)
├── consultantActions.ts      ← actions needing Node.js ("use node")
├── missions.ts               ← queries + mutations (V8)
├── missionActions.ts         ← actions needing Node.js ("use node")
├── schema.ts                 ← table definitions
├── crons.ts                  ← scheduled jobs
├── http.ts                   ← HTTP endpoints
└── _generated/               ← auto-generated (never edit)
```

**The separation rule:**
- Main entity file: `query`, `mutation`, `internalQuery`, `internalMutation`
- Actions file (with `"use node"` directive): `action`, `internalAction`
- **Never mix** `"use node"` with query/mutation exports

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Table names | camelCase, plural | `consultants`, `emailInboxConfigs` |
| Fields | camelCase | `organizationId`, `emailVerified` |
| Index names | `by_` + fields | `by_organization`, `by_organization_and_status` |
| Vector indexes | `by_embedding` | `by_embedding` with `filterFields` |
| Foreign keys | `{table}Id` | `organizationId`, `consultantId` |
| Timestamps | `{action}At` | `createdAt`, `updatedAt`, `lastSyncAt` |
| Enum values | lowercase snake_case | `"active"`, `"archived"`, `"pending"` |

## CRUD Export Names

Standard exports for entity files:

```typescript
// Public API
export const create = mutation({ ... })
export const list = query({ ... })
export const get = query({ ... })
export const update = mutation({ ... })
export const remove = mutation({ ... })    // "remove" not "delete" (reserved word)

// Batch operations
export const bulkUpdate = mutation({ ... })
export const updateMany = mutation({ ... })

// Internal variants (called only by other Convex functions)
export const createInternal = internalMutation({ ... })
export const updateInternal = internalMutation({ ... })
```

## Calling Between Functions

From actions, use `ctx.runQuery` / `ctx.runMutation` / `ctx.runAction`:

```typescript
export const processMatch = internalAction({
  args: { consultantId: v.id("consultants") },
  handler: async (ctx, args) => {
    const consultant = await ctx.runQuery(internal.consultants.getInternal, {
      id: args.consultantId,
    })
    // ... process with Node.js APIs ...
    await ctx.runMutation(internal.consultants.updateInternal, {
      id: args.consultantId,
      status: "processed",
    })
  },
})
```
