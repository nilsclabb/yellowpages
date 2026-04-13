import * as p from "@clack/prompts";
import pc from "picocolors";
import os from "node:os";
import path from "node:path";
import { createRequire } from "module";
import { PLATFORMS, detectPlatforms, getPlatform } from "./platforms.js";
import { installFiles, writeConfig, appendToInstructions } from "./install.js";
import { installCaveman } from "./caveman.js";
import { installSkillsManager } from "./skills-manager.js";
import { isInteractive } from "./tty.js";
import { splash, fillBar, customSpinner, celebration } from "./animations.js";

const _require = createRequire(import.meta.url);
const { version: VERSION } = _require("../package.json");

const SCOPE_LABELS = {
  full: "Full stack",
  skill: "Skill only",
  minimal: "Minimal",
};

export async function main() {
  const cwd = process.cwd();

  await splash(isInteractive);

  if (isInteractive) {
    console.log(`  ${pc.dim("Target:")} ${pc.cyan(cwd)}`);
    console.log();
  }

  // ── Platform (gateway question, unnumbered) ──

  const detected = detectPlatforms(cwd);
  const initialValue = detected.length > 0 ? detected[0] : "generic";

  const platform = await p.select({
    message: "Which platform are you using?",
    options: PLATFORMS.map((pl) => ({
      value: pl.value,
      label: detected.includes(pl.value) ? pc.cyan(pl.name) : pl.name,
      hint: pl.skillPath
        ? `${pl.skillPath}/${detected.includes(pl.value) ? pc.green("✓ detected") : ""}`
        : "enter path",
    })),
    initialValue,
  });

  if (p.isCancel(platform)) {
    p.cancel("Installation cancelled.");
    process.exit(0);
  }

  // Custom path input
  let customPath = null;
  if (platform === "custom") {
    customPath = await p.text({
      message: "Enter skill install path (relative to project root):",
      placeholder: ".my-agent/skills",
      validate: (v) => {
        if (!v || !v.trim()) return "Path is required";
        if (path.isAbsolute(v)) return "Must be relative to project root";
      },
    });
    if (p.isCancel(customPath)) {
      p.cancel("Installation cancelled.");
      process.exit(0);
    }
  }

  // ── Install location (global vs project) ──

  const platformDef = getPlatform(platform);

  const installLocation = await p.select({
    message: "Where should yellowpages be installed?",
    options: [
      {
        value: "project",
        label: "This project only",
        hint: `${customPath || platformDef.skillPath || "."}/yellowpages/`,
      },
      {
        value: "global",
        label: "Globally (all projects)",
        hint: `~/${path.relative(os.homedir(), platformDef.globalSkillPath || path.join(os.homedir(), ".agents", "skills"))}/yellowpages/`,
      },
    ],
  });

  if (p.isCancel(installLocation)) {
    p.cancel("Installation cancelled.");
    process.exit(0);
  }

  const isGlobal = installLocation === "global";

  // ── Dynamic question counter ──

  const showIntegration = platformDef?.hasIntegration === true && !isGlobal;
  const showProjectType = !isGlobal;
  const totalSteps = (showIntegration ? 1 : 0) + (showProjectType ? 1 : 0) + 2 + 1;
  // integration (conditional) + projectType (conditional) + state + config + scope = total
  let step = 0;

  function q(msg) {
    step++;
    return `${pc.yellow(`[${step} of ${totalSteps}]`)} ${msg}`;
  }

  // ── Integration style (Claude Code only) ──

  let integrationStyle = "skills-only";
  if (showIntegration) {
    integrationStyle = await p.select({
      message: q("How should yellowpages be integrated?"),
      options: [
        {
          value: "project-instructions",
          label: "Project instructions",
          hint: "CLAUDE.md + .claude/skills/",
        },
        {
          value: "skills-only",
          label: "Skills only",
          hint: ".claude/skills/",
        },
      ],
    });
    if (p.isCancel(integrationStyle)) {
      p.cancel("Installation cancelled.");
      process.exit(0);
    }
  }

  // ── Install scope ──

  const scope = await p.select({
    message: q("What would you like to install?"),
    options: [
      {
        value: "full",
        label: "Full stack",
        hint: "skill + references, scripts, workflows, checklists, templates, state",
      },
      {
        value: "skill",
        label: "Skill only",
        hint: "skill + references and scripts",
      },
      {
        value: "minimal",
        label: "Minimal",
        hint: "SKILL.md cover page only (preview)",
      },
    ],
  });
  if (p.isCancel(scope)) {
    p.cancel("Installation cancelled.");
    process.exit(0);
  }

  // ── Project type (project installs only) ──

  let projectType = "new";
  let workspacePath = null;

  if (showProjectType) {
    projectType = await p.select({
      message: q("What kind of project is this?"),
      options: [
        { value: "new", label: "New project", hint: "set up full directory structure" },
        { value: "existing", label: "Existing project", hint: "non-destructive merge" },
        { value: "monorepo", label: "Monorepo", hint: "prompts for workspace path" },
      ],
    });
    if (p.isCancel(projectType)) {
      p.cancel("Installation cancelled.");
      process.exit(0);
    }

    if (projectType === "monorepo") {
      workspacePath = await p.text({
        message: "Workspace path (relative to repo root):",
        placeholder: "packages/my-app",
        validate: (v) => {
          if (!v || !v.trim()) return "Workspace path is required";
        },
      });
      if (p.isCancel(workspacePath)) {
        p.cancel("Installation cancelled.");
        process.exit(0);
      }
    }
  }

  // ── State tracking ──

  const stateTracking = await p.confirm({
    message: q("Enable cross-session state tracking?"),
    initialValue: scope === "full",
  });
  if (p.isCancel(stateTracking)) {
    p.cancel("Installation cancelled.");
    process.exit(0);
  }

  // ── Config file ──

  const createConfig = await p.confirm({
    message: q("Create yellowpages.config.json for future upgrades?"),
    initialValue: true,
  });
  if (p.isCancel(createConfig)) {
    p.cancel("Installation cancelled.");
    process.exit(0);
  }

  // ── Resolve paths ──

  let skillPathAbsolute;
  let governancePath;
  let rootDir;

  if (isGlobal) {
    skillPathAbsolute = platformDef.globalSkillPath || path.join(os.homedir(), ".agents", "skills");
    governancePath = platformDef.globalGovernancePath;
    rootDir = os.homedir();
  } else if (projectType === "monorepo") {
    rootDir = path.join(cwd, workspacePath.trim());
    skillPathAbsolute = path.join(rootDir, customPath || platformDef.skillPath);
    governancePath = path.join(rootDir, ".agents");
  } else {
    rootDir = cwd;
    skillPathAbsolute = path.join(cwd, customPath || platformDef.skillPath);
    governancePath = path.join(cwd, ".agents");
  }

  const skillPathDisplay = isGlobal
    ? `~/${path.relative(os.homedir(), skillPathAbsolute)}/yellowpages/`
    : `${path.relative(cwd, skillPathAbsolute)}/yellowpages/`;

  const governanceDisplay = isGlobal
    ? `~/${path.relative(os.homedir(), governancePath)}/`
    : ".agents/";

  // Path display helpers — hoisted here so onFile callback can use them
  const displayBase = isGlobal ? os.homedir() : cwd;
  const prefix = isGlobal ? "~/" : "";

  function displayPath(absPath) {
    if (absPath.startsWith("/") || absPath.startsWith("\\")) {
      return prefix + path.relative(displayBase, absPath);
    }
    return absPath;
  }

  // ── Summary ──

  console.log();
  p.note(
    [
      `${pc.bold("Platform:")}     ${platformDef.name}`,
      `${pc.bold("Location:")}     ${isGlobal ? "Global (all projects)" : "Project"}`,
      `${pc.bold("Skill path:")}   ${skillPathDisplay}`,
      scope === "full" ? `${pc.bold("Governance:")}   ${governanceDisplay}` : null,
      `${pc.bold("Scope:")}        ${SCOPE_LABELS[scope]}`,
      !isGlobal
        ? `${pc.bold("Project:")}      ${projectType}${workspacePath ? ` (${workspacePath})` : ""}`
        : null,
      `${pc.bold("State:")}        ${stateTracking ? "yes" : "no"}`,
      `${pc.bold("Config:")}       ${createConfig ? "yes" : "no"}`,
    ]
      .filter(Boolean)
      .join("\n"),
    "Installation summary",
  );

  const confirmed = await p.confirm({
    message: "Proceed with installation?",
    initialValue: true,
  });
  if (p.isCancel(confirmed) || !confirmed) {
    p.cancel("Installation cancelled.");
    process.exit(0);
  }

  // ── Install ──

  // ── Install animation ────────────────────────────────────────────────────

  let spinner = null;

  try {
    if (isInteractive) {
      // Act 1: theatrical pre-install bar
      console.log();
      process.stdout.write("  " + pc.cyan("⚡ Preparing yellowpages v" + VERSION + "...") + "\n");
      await fillBar(20, 600);
      console.log();

      // Act 2: per-file spinner
      spinner = customSpinner(["◐", "◓", "◑", "◒"], 80);
      spinner.start(pc.dim("Installing skills..."));
    }

    function onFile(absPath, status) {
      if (!isInteractive || !spinner) return;
      // Determine next label before pausing
      const inGovernance = absPath.startsWith(governancePath);
      const nextLabel = pc.dim(inGovernance ? "Installing governance..." : "Installing skills...");
      // pause → write → update label → resume (order matters: update before resume)
      spinner.pause();
      const rel = displayPath(absPath);
      if (status === "created") {
        process.stdout.write("  " + pc.green("+") + " " + pc.cyan(rel) + "\n");
      } else {
        process.stdout.write(
          "  " + pc.yellow("~") + " " + pc.dim(rel) + pc.dim(" (exists, skipped)") + "\n",
        );
      }
      spinner.update(nextLabel);
      spinner.resume();
    }

    const result = installFiles(
      {
        skillPathAbsolute,
        governancePath,
        scope,
        projectType: isGlobal ? "new" : projectType,
        stateTracking,
      },
      onFile,
    );

    if (createConfig) {
      const configDir = isGlobal ? os.homedir() : rootDir;
      writeConfig(configDir, {
        version: VERSION,
        platform,
        installLocation,
        skillPath: path.relative(configDir, skillPathAbsolute),
        scope,
        projectType: isGlobal ? "global" : projectType,
        stateTracking,
        integrationStyle,
        installedAt: new Date().toISOString(),
      });
      result.created.push("yellowpages.config.json");
    }

    if (integrationStyle === "project-instructions" && !isGlobal) {
      appendToInstructions(rootDir, "CLAUDE.md");
      result.created.push("CLAUDE.md (appended)");
    }

    // Act 3: completion burst
    if (isInteractive && spinner) {
      spinner.stop();
      console.log();
      process.stdout.write(
        "  " +
          pc.bold(pc.green("✔")) +
          "  " +
          pc.bold(pc.green(result.created.length + " files installed")) +
          pc.dim(" · ") +
          pc.yellow(result.skipped.length + " skipped") +
          "\n",
      );
      await new Promise((r) => setTimeout(r, 200));
    }

    // ── Skills manager (core — always installed) ──
    try {
      installSkillsManager(platform, rootDir);
    } catch {
      p.log.warn("Skills manager install failed — run npx yp-stack again to retry.");
    }

    // ── Caveman terse mode ──
    console.log();
    const installCavemanMode = await p.confirm({
      message:
        "Install caveman terse mode? Cuts ~65% output tokens. ON by default, toggle with /caveman.",
      initialValue: true,
    });
    if (!p.isCancel(installCavemanMode) && installCavemanMode) {
      try {
        installCaveman(platform, rootDir);
        result.created.push("caveman terse mode");
      } catch {
        p.log.warn("Caveman install failed — install manually with: bash hooks/install.sh");
      }
    }

    // Outro celebration
    const nextSteps = [
      "📖  Read   " + pc.cyan("skills/yellowpages/SKILL.md"),
      "🤖  Open   " + pc.cyan("your agent platform"),
      "⚡  Run    " + pc.yellow("/yellowpages to get started"),
    ];
    await celebration(nextSteps, isInteractive);
  } catch (err) {
    if (spinner) {
      spinner.stop(pc.red("Installation failed"));
    }
    p.log.error(err.message);
    process.exit(1);
  }
}
