# No useEffect for Form Synchronization
**Status:** Approved (origin: huntermatcherv2, 2026-03-27)

**Contents:** [Why Banned](#why-useeffect-form-sync-is-banned) · [Approved Pattern](#approved-pattern-key-based-remount) · [Always-Edit Variant](#always-edit-mode-variant) · [Multi-State Consolidation](#multi-state-consolidation) · [Key Selection](#key-selection) · [Still Allowed](#what-is-still-allowed)

## Why useEffect Form Sync Is Banned

Using `useEffect` to copy server data into `useState` is fragile:

1. **Infinite loop risk** — query hook returns new object reference each render → `setState → re-render → useEffect → setState` never stops.
2. **Silent regression** — any future refactor that changes reference stability reintroduces the bug without warning.

## Approved Pattern: Key-Based Remount

When `key` changes, React remounts — `useState(initialValue)` runs once at mount, safe alternative to `useEffect`.

**Before (banned):**
```tsx
function DetailPage() {
  const { data: entity } = useEntity(id)
  const [form, setForm] = useState({ ...defaults })

  useEffect(() => {               // ← REMOVE THIS
    if (entity) setForm({ ...entity })
  }, [entity])

  return editing ? <InlineEditForm /> : <ReadOnlyView />
}
```

**After (approved):**
```tsx
function DetailPage() {
  const { data: entity } = useEntity(id)
  const [editing, setEditing] = useState(false)

  if (!entity) return <Skeleton />

  return editing
    ? <EntityEditForm
        key={entity._id}         // ← remount on entity change
        initialData={entity}      // ← snapshot at mount time
        onSave={() => setEditing(false)}
        onCancel={() => setEditing(false)}
      />
    : <ReadOnlyView entity={entity} onEdit={() => setEditing(true)} />
}

function EntityEditForm({ initialData, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initialData.name ?? '',
    email: initialData.email ?? '',
    // map all fields once — no useEffect
  })
  // ...
}
```

## Always-Edit-Mode Variant

```tsx
function ProfilePage() {
  const { data: me } = useMe()
  if (!me) return <Skeleton />
  return <ProfileForm key={me._id} initialData={me} />
}
```

## Multi-State Consolidation

Collapse multiple `useState` calls into one form object when removing `useEffect`:

```tsx
// Before: many useState + useEffect
useEffect(() => { setThreshold(cfg.threshold); setMaxCandidates(cfg.maxCandidates) }, [cfg])

// After: 1 form object, no useEffect
const [form, setForm] = useState({
  threshold: String(initialData.threshold ?? 0.5),
  maxCandidates: String(initialData.maxCandidates ?? 20),
})
```

## "Populate Once" Semantics

Snapshots server data at edit-mode entry. Server updates do NOT overwrite in-progress edits — intentional. Read-only views remain real-time. Appropriate for internal/low-concurrency tools.
## Key Selection

| Scenario | Key |
|---|---|
| Entity with stable Convex `_id` | `entity._id` |
| Config without `_id` | `"config"` (render conditionally) |
| User profile | `me._id` |

## What Is Still Allowed — `useEffect` remains legitimate for:
- DOM event listeners (click-outside, keyboard shortcuts)
- Auth state bridges (ConvexAuthBridge, ProtectedRoute, login redirect)
- Boolean/primitive dependencies with no mutation side effects
- Pipeline/status polling with no `setState` in the dependency array
