# Auth & Multi-Tenancy

- [The organizationId Pattern](#the-organizationid-pattern)
- [Role Hierarchy](#role-hierarchy)
- [Permission Checks (CASL)](#permission-checks-casl)
- [Helper Pattern](#helper-pattern)

## The organizationId Pattern

Every table has an `organizationId` field. Every query and mutation starts with an access check.

```typescript
export const list = query({
  args: { organizationId: v.id("organizations") },
  handler: async (ctx, args) => {
    const user = await requireOrganizationAccess(ctx, args.organizationId)
    return ctx.db
      .query("consultants")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .collect()
  },
})
```

**Never skip `requireOrganizationAccess`.** It authenticates the user AND verifies they belong to the requested organization.

## Role Hierarchy

Roles are numeric for easy comparison:

| Role | Level | Can do |
|---|---|---|
| `system_admin` | 100 | Everything, cross-org |
| `admin` | 80 | Org-wide settings, user management |
| `manager` | 60 | Team oversight, approvals |
| `support` | 40 | Read + limited writes |
| `consultant` | 20 | Own data only |
| `guest` | 0 | Read-only, scoped |

```typescript
// Check minimum role level
if (!hasMinRole(user.role, "manager")) {
  throw new ConvexError("Insufficient permissions")
}
```

## Permission Checks (CASL)

Backend uses `requirePermission` which throws `ConvexError` on deny:

```typescript
export const update = mutation({
  args: { id: v.id("consultants"), data: v.object({ ... }) },
  handler: async (ctx, args) => {
    const user = await requireOrganizationAccess(ctx, args.data.organizationId)
    requirePermission(user, "update", "Consultant")

    await ctx.db.patch(args.id, args.data)
  },
})
```

CASL abilities are defined in the shared package using `defineAbilitiesFor(role)`. The same definitions work on frontend and backend.

## Helper Pattern

```typescript
// convex/lib/auth.ts
export async function requireOrganizationAccess(
  ctx: QueryCtx | MutationCtx,
  organizationId: Id<"organizations">
) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new ConvexError("Not authenticated")

  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique()

  if (!user) throw new ConvexError("User not found")
  if (user.organizationId !== organizationId && user.role !== "system_admin") {
    throw new ConvexError("Access denied to this organization")
  }

  return user
}
```
