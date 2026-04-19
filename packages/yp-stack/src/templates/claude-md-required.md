<!-- yellowpages:start -->

## yellowpages (required)

This project requires the [yellowpages](https://github.com/nilsclabb/yellowpages) skill stack.
The agent workflows, conventions, and commands referenced throughout this repo assume it is
installed globally on the machine running the agent.

### Install (once per machine)

```bash
npx yp-stack
```

The install lives under `~/.claude/skills/yellowpages/`. Nothing is vendored into this repo.

### Verify

```bash
test -f "$HOME/.claude/skills/yellowpages/.yp-version" && echo "yellowpages installed" || echo "MISSING"
```

If the check prints `MISSING`, **STOP**. Do not proceed with agent work until `npx yp-stack`
has been run successfully. A PreToolUse hook in `.claude/settings.json` will block `Skill`
tool calls until the install marker is present.

<!-- yellowpages:end -->
