# Manage Global — Sources Reference

## npm package

```bash
# Download and extract to ~/.claude/skills/<name>/
npx skills add <package-name>
# Or for yellowpages skills:
npx yp-stack
```

## git URL

```bash
# Clone into a temp dir, copy skill directory
git clone <url> /tmp/skill-source
cp -r /tmp/skill-source/<skill-dir> ~/.claude/skills/<name>
rm -rf /tmp/skill-source
```

## Local path

```bash
# Copy from local directory
cp -r /path/to/skill ~/.claude/skills/<name>
```

## After any install

Always run:
```bash
# Verify skill is well-formed
# (use /validate skill inside Claude Code)
```

Then confirm the skill appears in `/status` on next session start.
