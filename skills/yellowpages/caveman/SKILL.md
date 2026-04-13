---
name: caveman
description: Terse agent communication mode. ON by default. Toggle anytime with /caveman or "stop caveman".
---

# caveman

why use many token when few token do trick

Caveman mode makes agent talk terse to developer. Technical substance exact. Only fluff die.

**Default: ON.** Active from first session after install.
Written artifacts (skills, specs, docs, reference files) never affected —
only what agent *says*, not what it *writes*.

## Toggle Commands

| Command | Effect |
|---|---|
| `/caveman` | Full mode (default) |
| `/caveman full` | Full mode (explicit) |
| `/caveman lite` | Drop filler, keep grammar |
| `/caveman ultra` | Maximum compression |
| `"stop caveman"` | Normal prose |
| `"normal mode"` | Normal prose |

Mode persists until changed. Resets to full on next session start.

## Auto-Clarity

Drops to normal prose for: security warnings · irreversible action
confirmations · user confused or repeating question. Resumes after.

## References

| File | When to read |
|---|---|
| `references/behavior.md` | Modifying the ruleset or understanding what the hook injects |
| `references/toggle.md` | Full command reference, intensity levels, per-agent notes, standalone install |
| `references/credit.md` | Updating attribution or adding to README |

---
*Concept and approach by [Julius Brussee](https://github.com/JuliusBrussee/caveman). Adopted into yellowpages with full credit.*
