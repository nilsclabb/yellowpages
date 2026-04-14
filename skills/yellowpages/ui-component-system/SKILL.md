---
name: ui-component-system
description: >
  Design system conventions for the shared component library built on Radix UI
  headless primitives, Tailwind CSS v4, and class-variance-authority (CVA).
  Covers component patterns, semantic color tokens, dark mode, and the full
  component catalog. Use when: creating a new UI component, styling a page,
  adding variants to a component, working with the color system, implementing
  dark mode, choosing which component to use, or importing from the shared
  UI package.
command: /ui-component-system
---

# UI Component System

Conventions for the `@workspace/ui` shared component library. Every component uses Radix UI headless primitives, Tailwind CSS v4 utilities, and CVA for type-safe variants.

## Core Rules

1. **Use only `@workspace/ui` components** — never install competing UI libraries
2. **Every component gets variant + size props** via CVA
3. **Every component accepts `className`** for composition
4. **Use semantic color tokens** — never raw hex/rgb in components
5. **Dark mode must work** — use CSS variables, not hardcoded colors

## Quick Import

```typescript
import { Button, Card, Select, Input } from "@workspace/ui"
import { cn } from "@workspace/ui/utils"
import "@workspace/ui/styles"  // CSS entry point (Tailwind vars + semantic colors)
```

## Reference Map

| When you need to... | Read |
|---|---|
| Write a component with CVA variants or use the `cn()` utility | [references/component-patterns.md](references/component-patterns.md) |
| Use color tokens, theming, or implement dark mode | [references/color-system.md](references/color-system.md) |
| Find the right component for a UI task | [references/component-catalog.md](references/component-catalog.md) |
