---
name: convex-patterns
description: >
  Conventions for writing Convex backend functions, designing schemas, handling
  auth and multi-tenancy, and managing errors. Use when: writing Convex queries,
  mutations, or actions, designing a Convex schema, adding indexes, setting up
  multi-tenant access control, handling errors in Convex, validating data on
  the backend, creating cron jobs, or defining HTTP endpoints.
command: /convex-patterns
---

# Convex Patterns

Backend conventions for Convex functions, schema design, auth, and error handling. These are opinionated patterns — not generic Convex docs.

**Critical rule:** Always read `convex/_generated/ai/guidelines.md` first when it exists in a project — it overrides general Convex knowledge from training data.

## The "use node" Rule

This is the #1 mistake agents make. It gets its own callout:

- Queries and mutations go in the **main entity file** (V8 runtime)
- Actions needing Node.js (`"use node"`) go in **separate files** with an `Actions` suffix
- **NEVER** put `"use node"` in a file that exports queries or mutations
- Example: `consultants.ts` (queries/mutations) + `consultantActions.ts` (Node.js actions)

## Reference Map

| When you need to... | Read |
|---|---|
| Organize files, name functions, or structure CRUD exports | [references/functions.md](references/functions.md) |
| Implement auth checks, multi-tenancy, or role-based access | [references/auth-multitenancy.md](references/auth-multitenancy.md) |
| Design tables, indexes, vectors, pagination, crons, or HTTP routes | [references/schema-patterns.md](references/schema-patterns.md) |
| Handle errors, validate data, or use Zod on the backend | [references/errors-validation.md](references/errors-validation.md) |
