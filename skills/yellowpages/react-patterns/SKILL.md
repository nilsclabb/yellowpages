---
name: react-patterns
description: React coding patterns and anti-patterns for this stack. Use this skill when writing React components, form state, data-sync hooks, or when reviewing code for useEffect misuse, form synchronization, or key-based remounting patterns.
command: /react-patterns
---

# react-patterns

Opinionated React patterns for this stack. Covers what NOT to do and the approved alternative — with rationale.

## The Core Rule

**Do not use `useEffect` to sync server data into form state.**

```tsx
// ❌ BANNED — fragile, infinite-loop risk
useEffect(() => {
  if (entity) setForm({ ...entity })
}, [entity])

// ✅ APPROVED — key-based remount, zero dependencies
<EditForm key={entity._id} initialData={entity} />
```

The approved pattern: extract a dedicated edit-form component, pass server data as `initialData` prop, key it on the entity ID. `useState(initialData)` initializer runs once at mount — no `useEffect` needed.

## What Is Still Allowed

`useEffect` is legitimate for:

- DOM side effects (event listeners, keyboard shortcuts, click-outside)
- Auth state bridges (ConvexAuthBridge, login redirects, protected routes)
- Boolean or stable dependencies with no infinite-loop risk

## References

| When you need to... | Read |
|---|---|
| Understand the full rationale, before/after code, and all edge cases | [references/no-useeffect-form-sync.md](references/no-useeffect-form-sync.md) |
