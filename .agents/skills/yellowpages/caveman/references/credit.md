# Credit

Caveman terse communication style adopted from:

**[caveman](https://github.com/JuliusBrussee/caveman)** by [Julius Brussee](https://github.com/JuliusBrussee)

> why use many token when few token do trick

## What Was Adopted

- Communication style concept and philosophy
- Hook architecture (SessionStart + UserPromptSubmit pattern)
- Lean rule body format (`rules/caveman-activate.md`)
- Toggle commands (`/caveman`, `/caveman lite`, `/caveman ultra`, "stop caveman")
- Intensity level definitions (lite / full / ultra)
- Auto-clarity conventions (drop for security warnings, irreversible actions, confused user)
- Boundary rules (written artifacts, code, commits always normal prose)
- Flag file mechanism (`~/.claude/.caveman-active`)

## What Is Different

- Packaged as a yellowpages-compliant skill (cover page + references, ≤80/100 lines)
- Installed via `npx yp-stack` alongside the yellowpages skill system
- Multi-agent installer using yellowpages' existing platform detection
- No companion skills in scope (caveman-compress, caveman-commit, caveman-review are future)

## License

The original caveman repo is MIT licensed.
