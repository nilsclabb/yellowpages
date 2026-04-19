#!/usr/bin/env node
import path from "node:path";
import fs from "node:fs";
import pc from "picocolors";
import { main } from "../src/index.js";
import { uninstallCaveman } from "../src/caveman.js";
import { detectPlatforms } from "../src/platforms.js";
import { runConfigCli } from "../src/config.js";
import { runTeamInit, modes as teamModes } from "../src/team-init.js";
import { runSnoozeCli } from "../src/update-check.js";

// ── config subcommand ────────────────────────────────────────────────────────
if (process.argv[2] === "config") {
  const code = runConfigCli(process.argv.slice(3));
  process.exit(code);
}

// ── snooze subcommand ────────────────────────────────────────────────────────
if (process.argv[2] === "snooze") {
  const code = runSnoozeCli(process.argv.slice(3));
  process.exit(code);
}

// ── --team {optional|required} ───────────────────────────────────────────────
const teamMode = parseTeamFlag(process.argv);
if (teamMode !== undefined) {
  if (teamMode === null) {
    console.error(
      `Error: --team requires a mode. Expected one of: ${teamModes().join(", ")}.\n` +
        `Usage: npx yp-stack --team <optional|required>`,
    );
    process.exit(1);
  }
  try {
    const result = runTeamInit({ mode: teamMode, cwd: process.cwd() });
    printTeamInitSummary(result);
    process.exit(0);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

function parseTeamFlag(argv) {
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--team") return argv[i + 1] ?? null;
    if (a.startsWith("--team=")) return a.slice("--team=".length) || null;
  }
  return undefined;
}

function printTeamInitSummary({ mode, cwd, steps }) {
  console.log();
  console.log(`  ${pc.bold("yellowpages team mode:")} ${pc.cyan(mode)}`);
  console.log(`  ${pc.dim("Repo:")} ${cwd}`);
  console.log();
  for (const s of steps) {
    const marker =
      s.status === "created"
        ? pc.green("+")
        : s.status === "updated"
          ? pc.yellow("~")
          : s.status === "unchanged"
            ? pc.dim("·")
            : s.kind === "migrated"
              ? pc.red("-")
              : " ";
    const label = s.path ? path.relative(cwd, s.path) || s.path : s.kind;
    const note =
      s.kind === "migrated" ? ` (removed: ${(s.removed || []).join(", ")})` : ` (${s.status})`;
    console.log(`  ${marker} ${label}${note}`);
  }
  console.log();
  console.log(`  ${pc.bold("Next steps:")}`);
  console.log(
    `    1. ${pc.cyan("git add CLAUDE.md .gitignore .claude/")}\n` +
      `    2. ${pc.cyan(`git commit -m "chore: adopt yellowpages (${mode})"`)}\n` +
      `    3. Teammates run: ${pc.cyan("npx yp-stack")}`,
  );
  console.log();
}

// ── --uninstall caveman ──────────────────────────────────────────────────────
if (process.argv.includes("--uninstall") && process.argv.includes("caveman")) {
  const cwd = process.cwd();

  // Read platform from yellowpages.config.json if available
  let platform = null;
  try {
    const config = JSON.parse(fs.readFileSync(path.join(cwd, "yellowpages.config.json"), "utf-8"));
    if (config.platform) platform = config.platform;
  } catch {}

  // Fall back to auto-detection
  if (!platform) {
    const detected = detectPlatforms(cwd);
    platform = detected[0] ?? "generic";
  }

  try {
    uninstallCaveman(platform, cwd);
    console.log(`Caveman uninstalled (platform: ${platform}).`);
  } catch (err) {
    console.error("Caveman uninstall failed:", err.message);
    process.exit(1);
  }
  process.exit(0);
}

// ── --uninstall skills-manager ───────────────────────────────────────────────
if (process.argv.includes("--uninstall") && process.argv.includes("skills-manager")) {
  const cwd = process.cwd();
  let platform = null;
  try {
    const config = JSON.parse(fs.readFileSync(path.join(cwd, "yellowpages.config.json"), "utf-8"));
    if (config.platform) platform = config.platform;
  } catch {}
  if (!platform) {
    const detected = detectPlatforms(cwd);
    platform = detected[0] ?? "generic";
  }
  try {
    const { uninstallSkillsManager } = await import("../src/skills-manager.js");
    uninstallSkillsManager(platform, cwd);
    console.log(`Skills manager uninstalled (platform: ${platform}).`);
  } catch (err) {
    console.error("Skills manager uninstall failed:", err.message);
    process.exit(1);
  }
  process.exit(0);
}

// ── Normal install flow ──────────────────────────────────────────────────────
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
