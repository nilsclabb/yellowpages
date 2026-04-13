#!/usr/bin/env python3
"""
Yellowpages Skill Validator

Validates skills against the yellowpages quality checklist:
  - Frontmatter (name + description)
  - Line limits (SKILL.md ≤ 80, references ≤ 100, INDEX.md ≤ 30)
  - Markdown link resolution (all links point to existing files)
  - TOC requirement (reference files > 80 lines must open with a TOC)
  - No auxiliary files (only SKILL.md, INDEX.md, references/, scripts/, assets/)

Usage:
    # Validate a single skill
    python quick_validate.py <skill-directory>

    # Validate all skills under a directory (recursive)
    python quick_validate.py --all <root-directory>

    # Validate all .md files for broken links only
    python quick_validate.py --links <root-directory>
"""

import sys
import os
import re
from pathlib import Path

# ── Frontmatter parsing (no PyYAML dependency) ──────────────────────────────

def parse_frontmatter(content):
    """Extract frontmatter as a dict. Handles multiline YAML values."""
    if not content.startswith("---"):
        return None, "No YAML frontmatter found"
    match = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not match:
        return None, "Invalid frontmatter format (missing closing ---)"
    raw = match.group(1)

    # Simple key-value parser that handles multiline strings
    result = {}
    current_key = None
    current_value_lines = []

    for line in raw.split("\n"):
        # New top-level key (not indented, has colon)
        key_match = re.match(r"^([a-z][a-z0-9_-]*)\s*:\s*(.*)", line)
        if key_match:
            # Save previous key
            if current_key:
                result[current_key] = "\n".join(current_value_lines).strip()
            current_key = key_match.group(1)
            value = key_match.group(2).strip()
            # Strip YAML block scalar indicators
            if value in (">", "|", ">-", "|-"):
                current_value_lines = []
            else:
                current_value_lines = [value]
        elif current_key and (line.startswith("  ") or line.strip() == ""):
            current_value_lines.append(line.strip())

    # Save last key
    if current_key:
        result[current_key] = "\n".join(current_value_lines).strip()

    return result, None


# ── Link extraction & resolution ────────────────────────────────────────────

def extract_markdown_links(content):
    """Extract all markdown links [text](path) from content, skipping code blocks.
    Returns list of (line_num, text, path)."""
    links = []
    in_code_block = False

    for i, line in enumerate(content.split("\n"), 1):
        # Track fenced code blocks (``` or ~~~)
        stripped = line.strip()
        if stripped.startswith("```") or stripped.startswith("~~~"):
            in_code_block = not in_code_block
            continue
        if in_code_block:
            continue

        # Remove inline code spans before scanning for links
        line_no_code = re.sub(r"`[^`]+`", "", line)

        for match in re.finditer(r"\[([^\]]*)\]\(([^)]+)\)", line_no_code):
            link_text = match.group(1)
            link_path = match.group(2)
            # Skip URLs, anchors, and mailto
            if link_path.startswith(("http://", "https://", "mailto:", "#")):
                continue
            # Strip anchor from path (e.g., "file.md#section" → "file.md")
            link_path = link_path.split("#")[0]
            if link_path:
                links.append((i, link_text, link_path))
    return links


def check_links(md_file):
    """Check all markdown links in a file resolve to existing files. Returns list of errors."""
    errors = []
    content = md_file.read_text(encoding="utf-8")
    links = extract_markdown_links(content)
    parent = md_file.parent

    for line_num, text, path in links:
        target = (parent / path).resolve()
        if not target.exists():
            errors.append(f"  L{line_num}: broken link [{text}]({path})")
    return errors


# ── Skill validation ────────────────────────────────────────────────────────

ALLOWED_ENTRIES = {"SKILL.md", "INDEX.md", "references", "scripts", "assets"}
ALLOWED_FM_KEYS = {"name", "description", "license", "allowed-tools", "metadata"}


def validate_skill(skill_path):
    """Full yellowpages validation of a skill directory. Returns (passed, errors)."""
    skill_path = Path(skill_path).resolve()
    errors = []

    # ── SKILL.md existence ──
    skill_md = skill_path / "SKILL.md"
    if not skill_md.exists():
        return False, ["SKILL.md not found"]

    content = skill_md.read_text(encoding="utf-8")
    lines = content.split("\n")

    # ── Frontmatter ──
    fm, fm_err = parse_frontmatter(content)
    if fm_err:
        errors.append(f"SKILL.md frontmatter: {fm_err}")
    elif fm:
        if "name" not in fm:
            errors.append("SKILL.md frontmatter: missing 'name'")
        elif not re.match(r"^[a-z0-9-]+$", fm["name"]):
            errors.append(f"SKILL.md frontmatter: name '{fm['name']}' must be hyphen-case")
        if "description" not in fm:
            errors.append("SKILL.md frontmatter: missing 'description'")
        elif len(fm["description"]) < 20:
            errors.append("SKILL.md frontmatter: description seems too short (< 20 chars)")
        unexpected = set(fm.keys()) - ALLOWED_FM_KEYS
        if unexpected:
            errors.append(f"SKILL.md frontmatter: unexpected keys: {', '.join(sorted(unexpected))}")

    # ── SKILL.md line limit ──
    if len(lines) > 80:
        errors.append(f"SKILL.md is {len(lines)} lines (limit: 80)")

    # ── SKILL.md link resolution ──
    link_errors = check_links(skill_md)
    if link_errors:
        errors.append("SKILL.md has broken links:")
        errors.extend(link_errors)

    # ── INDEX.md (optional but checked if present) ──
    index_md = skill_path / "INDEX.md"
    if index_md.exists():
        idx_lines = index_md.read_text(encoding="utf-8").split("\n")
        if len(idx_lines) > 30:
            errors.append(f"INDEX.md is {len(idx_lines)} lines (limit: 30)")
        idx_link_errors = check_links(index_md)
        if idx_link_errors:
            errors.append("INDEX.md has broken links:")
            errors.extend(idx_link_errors)

    # ── Reference files ──
    refs_dir = skill_path / "references"
    if refs_dir.is_dir():
        for ref in sorted(refs_dir.glob("*.md")):
            ref_content = ref.read_text(encoding="utf-8")
            ref_lines = ref_content.split("\n")
            ref_name = f"references/{ref.name}"

            # Line limit
            if len(ref_lines) > 100:
                errors.append(f"{ref_name} is {len(ref_lines)} lines (limit: 100)")

            # TOC check for files > 80 lines
            if len(ref_lines) > 80:
                # Check first 10 lines for TOC indicators (links with #anchors or bullet list of sections)
                head = "\n".join(ref_lines[:10])
                has_toc = bool(re.search(r"\(#[a-z]", head)) or bool(re.search(r"^-\s+\[", head, re.MULTILINE))
                if not has_toc:
                    errors.append(f"{ref_name} is {len(ref_lines)} lines but has no TOC in first 10 lines")

            # Link resolution
            ref_link_errors = check_links(ref)
            if ref_link_errors:
                errors.append(f"{ref_name} has broken links:")
                errors.extend(ref_link_errors)

    # ── No auxiliary files ──
    for entry in skill_path.iterdir():
        if entry.name.startswith("."):
            continue
        if entry.name not in ALLOWED_ENTRIES and not entry.is_dir():
            errors.append(f"Unexpected file: {entry.name} (allowed: {', '.join(sorted(ALLOWED_ENTRIES))})")
        if entry.is_dir() and entry.name not in ALLOWED_ENTRIES:
            # Allow sub-skill directories (they contain their own SKILL.md)
            if not (entry / "SKILL.md").exists():
                errors.append(f"Unexpected directory: {entry.name}/ (no SKILL.md found inside)")

    passed = len(errors) == 0
    return passed, errors


# ── Repo-wide validation ────────────────────────────────────────────────────

def find_skills(root):
    """Find all directories containing a SKILL.md under root."""
    root = Path(root).resolve()
    skills = []
    for skill_md in root.rglob("SKILL.md"):
        skills.append(skill_md.parent)
    return sorted(skills)


def check_all_links(root):
    """Check all .md files under root for broken links. Returns (file_count, error_count, errors)."""
    root = Path(root).resolve()
    all_errors = []
    file_count = 0

    for md_file in sorted(root.rglob("*.md")):
        # Skip node_modules, .git, etc.
        parts = md_file.relative_to(root).parts
        if any(p.startswith(".") and p != ".agents" for p in parts):
            continue
        if "node_modules" in parts:
            continue

        file_count += 1
        link_errors = check_links(md_file)
        if link_errors:
            rel = md_file.relative_to(root)
            all_errors.append((str(rel), link_errors))

    return file_count, all_errors


# ── CLI ─────────────────────────────────────────────────────────────────────

def print_result(label, passed, errors):
    status = "PASS" if passed else "FAIL"
    icon = "✅" if passed else "❌"
    print(f"\n{icon} {label}: {status}")
    for e in errors:
        print(f"   {e}")


def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python quick_validate.py <skill-directory>        Validate one skill")
        print("  python quick_validate.py --all <root-directory>   Validate all skills recursively")
        print("  python quick_validate.py --links <root-directory> Check all .md links")
        sys.exit(1)

    mode = sys.argv[1]

    # ── Single skill ──
    if mode not in ("--all", "--links"):
        skill_path = sys.argv[1]
        passed, errors = validate_skill(skill_path)
        print_result(skill_path, passed, errors)
        sys.exit(0 if passed else 1)

    # ── All skills ──
    if mode == "--all":
        if len(sys.argv) < 3:
            print("Usage: python quick_validate.py --all <root-directory>")
            sys.exit(1)
        root = sys.argv[2]
        skills = find_skills(root)
        if not skills:
            print(f"No skills found under {root}")
            sys.exit(1)

        total_pass = 0
        total_fail = 0
        for skill in skills:
            rel = skill.relative_to(Path(root).resolve())
            passed, errors = validate_skill(skill)
            print_result(str(rel), passed, errors)
            if passed:
                total_pass += 1
            else:
                total_fail += 1

        print(f"\n{'='*60}")
        print(f"Results: {total_pass} passed, {total_fail} failed, {total_pass + total_fail} total")
        sys.exit(0 if total_fail == 0 else 1)

    # ── Links only ──
    if mode == "--links":
        if len(sys.argv) < 3:
            print("Usage: python quick_validate.py --links <root-directory>")
            sys.exit(1)
        root = sys.argv[2]
        file_count, all_errors = check_all_links(root)

        if not all_errors:
            print(f"✅ All links valid across {file_count} markdown files")
            sys.exit(0)
        else:
            error_count = sum(len(errs) for _, errs in all_errors)
            print(f"❌ {error_count} broken link(s) in {len(all_errors)} file(s) (scanned {file_count} files)\n")
            for filepath, errs in all_errors:
                print(f"  {filepath}:")
                for e in errs:
                    print(f"    {e}")
            sys.exit(1)


if __name__ == "__main__":
    main()
