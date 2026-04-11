# Session Learnings

Cross-session agent memory. Written at the end of every session, read at the start of the next to avoid repeating mistakes and to accumulate repo-specific knowledge.

## File Location

```
.agents/state/learnings.jsonl
```

Append-only. One JSON object per line. Never delete entries.

## Schema

```json
{
  "date": "2025-04-11",
  "skill": "skill-creator",
  "type": "mistake | pattern | preference",
  "learning": "Plain-text description of what was learned."
}
```

**`type` values:**
- `mistake` — something that failed or caused a rework
- `pattern` — a recurring structure that works well in this repo
- `preference` — a user preference discovered during the session

## When to Write

At the end of every session where meaningful work was done, append 1–3 lines covering:
- Any approach that failed and why
- Any repo-specific quirk discovered (file location, naming convention, tool behavior)
- Any user preference revealed through feedback

Keep each learning to one sentence. Avoid restating things already in SKILL.md files.

## When to Read

Read the **last 20 lines** of `learnings.jsonl` at session start before taking any action. This gives recent context without overloading the context window with full history.

## Example Entries

```jsonl
{"date":"2025-04-11","skill":"skill-creator","type":"mistake","learning":"Running package_skill.py before testing scripts causes validation failures — test scripts first."}
{"date":"2025-04-11","skill":"yellowpages","type":"pattern","learning":"User prefers navigation tables over prose lists for reference maps."}
{"date":"2025-04-11","skill":"yellowpages","type":"preference","learning":"User wants line counts verified with PowerShell after every batch of file writes."}
```
