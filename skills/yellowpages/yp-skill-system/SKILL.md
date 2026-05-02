---
name: yp-skill-system
description: Use when creating, maintaining, validating, diagnosing, or managing yellowpages skills and the yellowpages skill library itself.
---

# Skill System Router

Route work about yellowpages itself: skill authoring, skill quality, skill library maintenance, and project/global skill inventory.

## Routing Table

| User intent | Load |
|---|---|
| Understand yellowpages standards, split skill content, design skill architecture | `yellowpages` |
| Create or scaffold a new skill | `scaffold-skill` |
| Validate one skill | `validate-skill` |
| Diagnose many skills or produce fix instructions | `yp-diagnose` |
| Inspect or manage globally installed skill libraries | `manage-global-skills` |
| Inspect or manage project agent context | `manage-project-skills` |

## Rule

Use this category only for skill-system work. Do not route normal app-building requests here unless the user is changing yellowpages or authoring skills.
