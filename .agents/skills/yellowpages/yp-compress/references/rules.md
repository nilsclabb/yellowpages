# Compress — Rules Reference

## Rewrite (apply terse caveman-style to prose)

- Drop articles: a, an, the
- Drop filler: just, really, basically, essentially, simply, very, quite
- Drop pleasantries: "Please note that...", "It's important to...", "Keep in mind..."
- Drop hedging: "I think", "It seems like", "You might want to consider"
- Shorten verbose phrases: "is responsible for" → "handles"; "in order to" → "to"; "is able to" → "can"
- Use fragments where meaning is unambiguous

## Never rewrite (pass through exactly)

- Headings (lines starting with `#`)
- Code blocks (content between ``` fences)
- Inline code (content between single backticks)
- URLs and markdown links (preserve full `[text](url)`)
- File paths (any string containing `/` or `\`)
- Shell commands
- Dates and version numbers (e.g. 2026-04-13, v1.2.3, v0.1.0)
- Technical identifiers: npm package names, env var names, function names
- Proper nouns: product names, company names, tool names

## Quality check (run after compression)

Verify before writing to disk:
- All headings preserved (same count as original)
- All code blocks intact (same count as original)
- All URLs/links unchanged (spot-check 3)
- Technical terms not altered (spot-check 5)
- Semantic meaning preserved for each section (spot-check 3 sections)

If any check fails: patch only failing sections and re-verify. Max 2 retries.
