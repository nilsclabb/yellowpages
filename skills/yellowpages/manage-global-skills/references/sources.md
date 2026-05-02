# Manage Global — Sources Reference

## Native plugin

Use the host's plugin mechanism when available: Claude plugin marketplace, Cursor plugin manifest, Gemini extension, or OpenCode plugin.

## git URL

```bash
git clone <url> ~/.agents/<name>
mkdir -p ~/.agents/skills
ln -s ~/.agents/<name>/skills/<library> ~/.agents/skills/<library>
```

## Local path

```bash
# Copy from local directory
cp -r /path/to/skill ~/.claude/skills/<name>
```

## After any install

Always run `validate-skill` on the installed skill path.

Then restart the host and confirm the skill appears in native skill discovery.
