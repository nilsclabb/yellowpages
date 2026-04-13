# Diagnose — Yellowpages Standards Reference

The five non-negotiable rules every skill must follow:

1. **Cover-page brevity** — every `SKILL.md` ≤ 80 lines
2. **One job per file** — files either route (navigate) or explain (detail), never both
3. **Load on demand** — agents read sub-files only when the current task requires that branch
4. **Deep-link navigation** — every reference link includes "when to read" annotation, not bare links
5. **Self-documenting index** — every skill has an entry in `INDEX.md` or `SKILLS-INDEX.md`

## Additional checks

| Rule | Threshold |
|---|---|
| Reference files | ≤ 100 lines each |
| Frontmatter | `name:` and `description:` required |
| `name:` value | Must match directory name exactly |
| Folder contents | Only `SKILL.md`, `references/`, `scripts/`, `assets/` — no auxiliary docs |
| Reference links | All listed files must exist on disk |
| Publishable mirror | `skills/yellowpages/<name>/` must match `.agents/` version |
