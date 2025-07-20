#!/usr/bin/env node

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'path';

import { Command } from 'commander';

import swUtils from './sw-update.js';

const program = new Command();

const SwUtils = swUtils(path.join(process.cwd(), 'sw.js'), {
  path,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
});

program
  .name('update-sw')
  .description("CLI to maintain the project's Service Worker (sw.js)")
  .version('0.0.0');

program
  .command('name')
  .description('Updates the name of the application.')
  .argument('<appName>', 'Application Name')
  .action(SwUtils.writeApplicationName);

program
  .command('major')
  .description('Updates the major element of the semantic version.')
  .action(SwUtils.updateMajorSemver);

program
  .command('minor')
  .description('Updates the minor element of the semantic version.')
  .action(SwUtils.updateMinorSemver);

program
  .command('patch')
  .description('Updates the patch element of the semantic version.')
  .action(SwUtils.updatePatchSemver);

program
  .command('assets')
  .description('Updates the assets to be included.')
  .argument('<assets...>', 'list of source files and folders')
  .action(SwUtils.processAssets);

program.parse();
