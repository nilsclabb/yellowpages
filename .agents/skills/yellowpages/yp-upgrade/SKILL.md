---
name: yp-upgrade
description: Update yp-stack to the latest version — re-runs npx yp-stack@latest with existing config.
---

# /yp:upgrade

Update yp-stack to the latest published version. Uses existing `yellowpages.config.json` if present — no prompts needed.

## What Claude does

1. Read `yellowpages.config.json` from cwd — note current version and platform
2. Run: `npx yp-stack@latest` (non-interactive if config exists; interactive if not)
3. After install: read `yellowpages.config.json` again — report old version → new version
4. If version unchanged: "Already on latest version (<version>)."
5. If upgraded: "Upgraded yp-stack <old> → <new>. Run `/yp:status` to verify hook health."

## Notes

- Requires network access to npm registry
- If `yellowpages.config.json` is absent, the installer runs interactively (platform selection required)
- Skills are re-installed to the same scope (global or project-local) as the previous install
