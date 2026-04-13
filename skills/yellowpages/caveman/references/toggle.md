# Caveman Toggle Reference

## Commands

| Command | Effect |
|---|---|
| `/caveman` | Full mode (default) |
| `/caveman full` | Full mode (explicit) |
| `/caveman lite` | Lite mode — drop filler, keep grammar |
| `/caveman ultra` | Ultra mode — maximum compression |
| `"stop caveman"` | Normal prose (session-local on non-Claude Code agents) |
| `"normal mode"` | Normal prose (session-local on non-Claude Code agents) |

## Mode Persistence

### Claude Code
Tracked via flag file `~/.claude/.caveman-active`. Persists across turns within
a session. "stop caveman" deletes the flag. Next SessionStart resets to `full` —
there is no cross-session off state.

### All Other Agents (Cursor, Windsurf, Cline, Roo, Copilot, OpenCode)
"stop caveman" is session-local. The always-on rule file re-activates caveman
at the start of every new session. To persistently disable, remove the installed
rule file (see standalone section below).

## Standalone Install / Uninstall (Claude Code only)

For developers who cloned the repo and are not using `npx yp-stack`:

```bash
bash hooks/install.sh    # install caveman hooks
bash hooks/uninstall.sh  # remove caveman hooks
```

`install.sh` copies hook files to `~/.claude/hooks/` and patches `~/.claude/settings.json`.

## Via npx yp-stack

```bash
npx yp-stack                      # install includes caveman prompt
npx yp-stack --uninstall caveman  # remove caveman for detected/configured platform
```
