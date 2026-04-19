#!/usr/bin/env bash
# yellowpages enforcement hook — PreToolUse for Skill tool calls.
#
# Emits a Claude Code hook JSON payload to stdout. When the global
# yellowpages install marker is missing, denies the tool call with an
# install instruction. Otherwise allows it (empty object).
#
# Managed by `npx yp-stack --team`. Safe to edit, but re-running
# --team will overwrite this file.

set -eu

MARKER="${YP_VERSION_MARKER:-$HOME/.claude/skills/yellowpages/.yp-version}"

if [ ! -f "$MARKER" ]; then
  cat >&2 <<'EOF'
yellowpages is required for this project but is not installed globally.

Install with:

  npx yp-stack

After install, retry your last action.
EOF

  printf '%s\n' '{"permissionDecision":"deny","message":"yellowpages is required but not installed. Run: npx yp-stack"}'
  exit 0
fi

printf '%s\n' '{}'
exit 0
