# Component Patterns

## CVA Pattern

Every component follows the same structure — variants defined with CVA, composed with `cn()`:

```typescript
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@workspace/ui/utils"

const buttonVariants = cva(
  // Base classes (always applied)
  "inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors focus-visible:outline-2",
  {
    variants: {
      variant: {
        default: "bg-brand-violet text-white hover:bg-brand-violet/90",
        destructive: "bg-status-red text-white hover:bg-status-red/90",
        outline: "border border-brand-violet text-brand-violet hover:bg-brand-violet/8",
        ghost: "hover:bg-surface-secondary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
}
```

## The `cn()` Utility

Combines `clsx` (conditional classes) + `tailwind-merge` (deduplicates conflicting Tailwind classes):

```typescript
// packages/ui/src/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Usage:

```typescript
<div className={cn("p-4 rounded-lg", isActive && "bg-surface-secondary", className)} />
```

## Component Checklist

When creating a new component:

1. Define variants with `cva()` — include `variant` and `size` at minimum
2. Set `defaultVariants` so the component works without props
3. Export `VariantProps<typeof fooVariants>` in the component's props type
4. Accept `className` prop and merge with `cn()`
5. Use semantic color tokens in variant values (never raw hex)
6. Test both light and dark mode appearance
7. Use responsive prefixes (`sm:`, `md:`, `lg:`) for layout shifts
