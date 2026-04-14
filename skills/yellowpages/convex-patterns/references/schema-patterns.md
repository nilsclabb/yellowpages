# Schema, Indexing & Infrastructure Patterns

- [Table Definition](#table-definition)
- [Indexing Rules](#indexing-rules)
- [Pagination](#pagination)
- [Cron Jobs](#cron-jobs)
- [HTTP Endpoints](#http-endpoints)

## Table Definition

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  consultants: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    email: v.string(),
    status: v.union(v.literal("active"), v.literal("archived"), v.literal("pending")),
    skills: v.array(v.string()),
    embedding: v.optional(v.array(v.float64())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_organization_and_status", ["organizationId", "status"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["organizationId"],
    }),
})
```

## Indexing Rules

1. **Always index `organizationId` first** — multi-tenant isolation is the primary filter
2. **Compound indexes** for common query patterns (org + status, org + date range)
3. **Vector indexes** for AI embedding search — always include `organizationId` in `filterFields`
4. Index name format: `by_` + field names joined with `_and_`

## Pagination

Use Convex built-in pagination:

```typescript
import { paginationOptsValidator } from "convex/server"

export const list = query({
  args: {
    organizationId: v.id("organizations"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    await requireOrganizationAccess(ctx, args.organizationId)
    return ctx.db
      .query("consultants")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .paginate(args.paginationOpts)
    // Returns: { page: Doc[], isDone: boolean, continueCursor: string }
  },
})
```

## Cron Jobs

Defined in `convex/crons.ts`:

```typescript
import { cronJobs } from "convex/server"
import { internal } from "./_generated/api"

const crons = cronJobs()

crons.interval("sync emails", { minutes: 5 }, internal.emailActions.syncAll)
crons.interval("process pipeline", { hours: 1 }, internal.pipelineActions.processQueue)
crons.daily("refresh embeddings", { hourUTC: 3 }, internal.embeddingActions.refreshStale)

export default crons
```

## HTTP Endpoints

Defined in `convex/http.ts` for webhooks and third-party integrations:

```typescript
import { httpRouter } from "convex/server"
import { postWebhook } from "./webhookActions"

const http = httpRouter()

http.route({ path: "/webhooks/provider", method: "POST", handler: postWebhook })

export default http
```
