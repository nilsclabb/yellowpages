import * as p from '@clack/prompts';
import pc from 'picocolors';
import os from 'node:os';
import path from 'node:path';
import { PLATFORMS, detectPlatforms, getPlatform } from './platforms.js';
import { installFiles, writeConfig, appendToInstructions } from './install.js';

const VERSION = '0.1.0';

const SCOPE_LABELS = {
  full: 'Full stack',
  skill: 'Skill only',
  minimal: 'Minimal',
};

export async function main() {
  const cwd = process.cwd();

  console.log();
  p.intro(pc.bgCyan(pc.black(' yp-stack ')));

  console.log();
  console.log(`  ${pc.dim('The yellowpages skill system for AI agents')}`);
  console.log(`  ${pc.dim('Target:')} ${pc.cyan(cwd)}`);
  console.log();

  // ── Platform (gateway question, unnumbered) ──

  const detected = detectPlatforms(cwd);
  const initialValue = detected.length > 0 ? detected[0] : 'generic';

  const platform = await p.select({
    message: 'Which platform are you using?',
    options: PLATFORMS.map((pl) => ({
      value: pl.value,
      label: pl.name,
      hint: pl.skillPath
        ? `${pl.skillPath}/${detected.includes(pl.value) ? pc.green(' detected') : ''}`
        : 'enter path',
    })),
    initialValue,
  });

  if (p.isCancel(platform)) {
    p.cancel('Installation cancelled.');
    process.exit(0);
  }

  // Custom path input
  let customPath = null;
  if (platform === 'custom') {
    customPath = await p.text({
      message: 'Enter skill install path (relative to project root):',
      placeholder: '.my-agent/skills',
      validate: (v) => {
        if (!v || !v.trim()) return 'Path is required';
        if (path.isAbsolute(v)) return 'Must be relative to project root';
      },
    });
    if (p.isCancel(customPath)) {
      p.cancel('Installation cancelled.');
      process.exit(0);
    }
  }

  // ── Install location (global vs project) ──

  const platformDef = getPlatform(platform);

  const installLocation = await p.select({
    message: 'Where should yellowpages be installed?',
    options: [
      {
        value: 'project',
        label: 'This project only',
        hint: `${customPath || platformDef.skillPath || '.'}/yellowpages/`,
      },
      {
        value: 'global',
        label: 'Globally (all projects)',
        hint: `~/${path.relative(os.homedir(), platformDef.globalSkillPath || path.join(os.homedir(), '.agents', 'skills'))}/yellowpages/`,
      },
    ],
  });

  if (p.isCancel(installLocation)) {
    p.cancel('Installation cancelled.');
    process.exit(0);
  }

  const isGlobal = installLocation === 'global';

  // ── Dynamic question counter ──

  const showIntegration = platformDef?.hasIntegration === true && !isGlobal;
  const showProjectType = !isGlobal;
  const totalSteps = (showIntegration ? 1 : 0) + (showProjectType ? 1 : 0) + 2 + 1;
  // integration (conditional) + projectType (conditional) + state + config + scope = total
  let step = 0;

  function q(msg) {
    step++;
    return `${pc.dim(`[${step} of ${totalSteps}]`)} ${msg}`;
  }

  // ── Integration style (Claude Code only) ──

  let integrationStyle = 'skills-only';
  if (showIntegration) {
    integrationStyle = await p.select({
      message: q('How should yellowpages be integrated?'),
      options: [
        {
          value: 'project-instructions',
          label: 'Project instructions',
          hint: 'CLAUDE.md + .claude/skills/',
        },
        {
          value: 'skills-only',
          label: 'Skills only',
          hint: '.claude/skills/',
        },
      ],
    });
    if (p.isCancel(integrationStyle)) {
      p.cancel('Installation cancelled.');
      process.exit(0);
    }
  }

  // ── Install scope ──

  const scope = await p.select({
    message: q('What would you like to install?'),
    options: [
      {
        value: 'full',
        label: 'Full stack',
        hint: 'skill + references, scripts, workflows, checklists, templates, state',
      },
      {
        value: 'skill',
        label: 'Skill only',
        hint: 'skill + references and scripts',
      },
      {
        value: 'minimal',
        label: 'Minimal',
        hint: 'SKILL.md cover page only (preview)',
      },
    ],
  });
  if (p.isCancel(scope)) {
    p.cancel('Installation cancelled.');
    process.exit(0);
  }

  // ── Project type (project installs only) ──

  let projectType = 'new';
  let workspacePath = null;

  if (showProjectType) {
    projectType = await p.select({
      message: q('What kind of project is this?'),
      options: [
        { value: 'new', label: 'New project', hint: 'set up full directory structure' },
        { value: 'existing', label: 'Existing project', hint: 'non-destructive merge' },
        { value: 'monorepo', label: 'Monorepo', hint: 'prompts for workspace path' },
      ],
    });
    if (p.isCancel(projectType)) {
      p.cancel('Installation cancelled.');
      process.exit(0);
    }

    if (projectType === 'monorepo') {
      workspacePath = await p.text({
        message: 'Workspace path (relative to repo root):',
        placeholder: 'packages/my-app',
        validate: (v) => {
          if (!v || !v.trim()) return 'Workspace path is required';
        },
      });
      if (p.isCancel(workspacePath)) {
        p.cancel('Installation cancelled.');
        process.exit(0);
      }
    }
  }

  // ── State tracking ──

  const stateTracking = await p.confirm({
    message: q('Enable cross-session state tracking?'),
    initialValue: scope === 'full',
  });
  if (p.isCancel(stateTracking)) {
    p.cancel('Installation cancelled.');
    process.exit(0);
  }

  // ── Config file ──

  const createConfig = await p.confirm({
    message: q('Create yellowpages.config.json for future upgrades?'),
    initialValue: true,
  });
  if (p.isCancel(createConfig)) {
    p.cancel('Installation cancelled.');
    process.exit(0);
  }

  // ── Resolve paths ──

  let skillPathAbsolute;
  let governancePath;
  let rootDir;

  if (isGlobal) {
    skillPathAbsolute = platformDef.globalSkillPath || path.join(os.homedir(), '.agents', 'skills');
    governancePath = platformDef.globalGovernancePath;
    rootDir = os.homedir();
  } else if (projectType === 'monorepo') {
    rootDir = path.join(cwd, workspacePath.trim());
    skillPathAbsolute = path.join(rootDir, customPath || platformDef.skillPath);
    governancePath = path.join(rootDir, '.agents');
  } else {
    rootDir = cwd;
    skillPathAbsolute = path.join(cwd, customPath || platformDef.skillPath);
    governancePath = path.join(cwd, '.agents');
  }

  const skillPathDisplay = isGlobal
    ? `~/${path.relative(os.homedir(), skillPathAbsolute)}/yellowpages/`
    : `${path.relative(cwd, skillPathAbsolute)}/yellowpages/`;

  const governanceDisplay = isGlobal
    ? `~/${path.relative(os.homedir(), governancePath)}/`
    : '.agents/';

  // ── Summary ──

  console.log();
  p.note(
    [
      `${pc.bold('Platform:')}     ${platformDef.name}`,
      `${pc.bold('Location:')}     ${isGlobal ? 'Global (all projects)' : 'Project'}`,
      `${pc.bold('Skill path:')}   ${skillPathDisplay}`,
      scope === 'full' ? `${pc.bold('Governance:')}   ${governanceDisplay}` : null,
      `${pc.bold('Scope:')}        ${SCOPE_LABELS[scope]}`,
      !isGlobal ? `${pc.bold('Project:')}      ${projectType}${workspacePath ? ` (${workspacePath})` : ''}` : null,
      `${pc.bold('State:')}        ${stateTracking ? 'yes' : 'no'}`,
      `${pc.bold('Config:')}       ${createConfig ? 'yes' : 'no'}`,
    ]
      .filter(Boolean)
      .join('\n'),
    'Installation summary'
  );

  const confirmed = await p.confirm({
    message: 'Proceed with installation?',
    initialValue: true,
  });
  if (p.isCancel(confirmed) || !confirmed) {
    p.cancel('Installation cancelled.');
    process.exit(0);
  }

  // ── Install ──

  const spinner = p.spinner();
  spinner.start(`Installing yellowpages v${VERSION}`);

  try {
    const result = installFiles({
      skillPathAbsolute,
      governancePath,
      scope,
      projectType: isGlobal ? 'new' : projectType,
      stateTracking,
    });

    if (createConfig) {
      const configDir = isGlobal ? os.homedir() : rootDir;
      writeConfig(configDir, {
        version: VERSION,
        platform,
        installLocation,
        skillPath: path.relative(configDir, skillPathAbsolute),
        scope,
        projectType: isGlobal ? 'global' : projectType,
        stateTracking,
        integrationStyle,
        installedAt: new Date().toISOString(),
      });
      result.created.push('yellowpages.config.json');
    }

    if (integrationStyle === 'project-instructions' && !isGlobal) {
      appendToInstructions(rootDir, 'CLAUDE.md');
      result.created.push('CLAUDE.md (appended)');
    }

    spinner.stop('Installation complete');

    // Results — show paths relative to home (global) or cwd (project)
    const displayBase = isGlobal ? os.homedir() : cwd;
    const prefix = isGlobal ? '~/' : '';

    function displayPath(absPath) {
      if (absPath.startsWith('/') || absPath.startsWith('\\')) {
        return prefix + path.relative(displayBase, absPath);
      }
      return absPath;
    }

    const lines = [];
    for (const f of result.created) {
      lines.push(`${pc.green('+')} ${displayPath(f)}`);
    }
    for (const f of result.skipped) {
      lines.push(`${pc.yellow('~')} ${displayPath(f)} ${pc.dim('(exists, skipped)')}`);
    }

    if (lines.length > 0) {
      console.log();
      p.note(lines.join('\n'), `${result.created.length} created, ${result.skipped.length} skipped`);
    }

    console.log();
    p.outro(pc.green('Done! Yellowpages is ready.'));
  } catch (err) {
    spinner.stop('Installation failed');
    p.log.error(err.message);
    process.exit(1);
  }
}
