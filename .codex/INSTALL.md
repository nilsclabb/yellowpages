# Installing Yellowpages for Codex

Codex discovers skills from `~/.agents/skills/`. Clone yellowpages and symlink the skill library.

```bash
git clone https://github.com/nilsclabb/yellowpages.git ~/.codex/yellowpages
mkdir -p ~/.agents/skills
ln -s ~/.codex/yellowpages/skills/yellowpages ~/.agents/skills/yellowpages
```

Restart Codex after installing.

## Windows

Use a junction instead of a symlink:

```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.agents\skills"
cmd /c mklink /J "$env:USERPROFILE\.agents\skills\yellowpages" "$env:USERPROFILE\.codex\yellowpages\skills\yellowpages"
```

## Updating

```bash
cd ~/.codex/yellowpages && git pull
```

The symlink makes skill updates visible after restart.
