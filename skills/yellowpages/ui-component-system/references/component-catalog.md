# Component Catalog

All components available in `@workspace/ui`. Import individually or as a group.

```typescript
import { Button, Card, Input, Select } from "@workspace/ui"
```

## Forms

| Component | Purpose |
|---|---|
| `Button` | Primary action trigger (variants: default, destructive, outline, ghost) |
| `Input` | Text input field |
| `Textarea` | Multi-line text input |
| `Checkbox` | Boolean toggle with label |
| `Select` | Dropdown selection (Radix-based) |
| `Label` | Form field label with required indicator |

## Layout

| Component | Purpose |
|---|---|
| `Card` | Contained content section with optional header/footer |
| `Section` | Semantic page section with heading |
| `Surface` | Background container using surface tokens |
| `Separator` | Visual divider (horizontal/vertical) |

## Navigation

| Component | Purpose |
|---|---|
| `DropdownMenu` | Context menu with items, separators, sub-menus (Radix-based) |
| `Tabs` | Tabbed content switcher (Radix-based) |

## Feedback

| Component | Purpose |
|---|---|
| `Toast` | Temporary notification (success, error, info) |
| `Tooltip` | Hover-triggered info overlay (Radix-based) |
| `Badge` | Status/category label (variants: default, success, warning, error) |
| `StatusBanner` | Full-width alert bar |
| `Metric` | Key-value display for dashboards |

## Data

| Component | Purpose |
|---|---|
| `Table` | Data table with sortable columns |
| `PropertyList` | Key-value pair list for detail views |
| `ScrollArea` | Custom scrollbar container (Radix-based) |

## Modals

| Component | Purpose |
|---|---|
| `Dialog` | Modal overlay with title, content, actions (Radix-based) |
| `Popover` | Positioned floating content (Radix-based) |

## Loading

| Component | Purpose |
|---|---|
| `Skeleton` | Content placeholder during loading |
| `Spinner` | Animated loading indicator |

## Choosing a Component

- **Need user input?** → Forms section
- **Structuring a page?** → Layout section
- **Showing feedback?** → Check Feedback before building custom
- **Displaying data?** → Table for lists, PropertyList for detail views
- **Need an overlay?** → Dialog for blocking, Popover for contextual
