# Installing Yellowpages for OpenCode

Add yellowpages to the `plugin` array in `opencode.json`:

```json
{
  "plugin": ["yellowpages@git+https://github.com/nilsclabb/yellowpages.git"]
}
```

Restart OpenCode. The plugin registers `skills/yellowpages/` and injects only the `using-yellowpages` bootstrap.

## Usage

Use OpenCode's native skill tool:

```text
use skill tool to list yellowpages skills
use skill tool to load yellowpages/yp-workflow
```

## Updating

OpenCode reinstalls git plugins on restart. Pin a tag if you need a fixed version:

```json
{
  "plugin": ["yellowpages@git+https://github.com/nilsclabb/yellowpages.git#v0.6.0"]
}
```
