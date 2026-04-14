# Color System & Theming

## Semantic Color Tokens

All colors are CSS variables. Components reference tokens, never raw values.

### Surfaces

| Token | Usage |
|---|---|
| `--surface` | Primary background |
| `--surface-secondary` | Subtle background (cards, sidebars) |
| `--surface-tertiary` | Deeply nested or muted areas |

### Text

| Token | Usage |
|---|---|
| `--text-primary` | Main body text |
| `--text-secondary` | Supporting/label text |
| `--text-tertiary` | Placeholder, disabled text |

### Brand

| Token | Usage |
|---|---|
| `--color-brand-violet` | Primary brand actions, links |
| `--color-brand-peach` | Secondary accent, highlights |

### Status

| Token | Usage |
|---|---|
| `--status-red` | Destructive actions, error backgrounds |
| `--status-green` | Success actions, confirmation |
| `--status-error-text` | Error message text |
| `--status-success-text` | Success message text |

## Using Tokens in Tailwind

Tokens map to Tailwind utility classes:

```html
<div class="bg-surface text-primary">             <!-- surfaces + text -->
<button class="bg-brand-violet hover:bg-brand-violet/90">  <!-- brand -->
<span class="text-status-error-text">              <!-- status -->
```

## Dark Mode

Dark mode activates via `.dark` class on `<html>`. Token values shift automatically — components need zero changes.

```css
:root {
  --surface: #ffffff;
  --text-primary: #1a1a2e;
  --color-brand-violet: #7c3aed;
}

.dark {
  --surface: #0f0f1a;
  --text-primary: #e2e2f0;
  --color-brand-violet: #a78bfa;
}
```

**Rules:**
- Never use hardcoded colors in components — always reference tokens
- Never use `dark:` Tailwind variants directly — rely on CSS variable shifts
- Theme toggle updates `useThemeStore` and toggles `.dark` class on `<html>`
- Every new color must be added as a token in both light and dark definitions
