#!/usr/bin/env node

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'path';
import { Command } from 'commander';

const filePath = path.join(process.cwd(), 'sw.js');
const sw = readFileSync(filePath, 'utf8');

const sections = sw.split(/[\[\]]/);
const version = sections[0].match(
  /const version = '(?<maj>\d+)\.(?<min>\d+)\.(?<pat>\d+)'/
);
const semver = version.groups;

const program = new Command();

program
  .name('update-sw')
  .description("CLI to maintain the project's Service Worker (sw.js)")
  .version('0.0.0');

program
  .command('name')
  .description('Updates the name of the application.')
  .argument('<appName>', 'Application Name')
  .action(writeAppName);

program
  .command('major')
  .description('Updates the major element of the semantic version.')
  .action(() => {
    semver.maj = `${+semver.maj + 1}`;
    semver.min = `0`;
    semver.pat = `0`;
    writeVersion(semver);
  });

program
  .command('minor')
  .description('Updates the minor element of the semantic version.')
  .action(() => {
    semver.min = `${+semver.min + 1}`;
    semver.pat = `0`;
    writeVersion(semver);
  });

program
  .command('patch')
  .description('Updates the patch element of the semantic version.')
  .action(() => {
    semver.pat = `${+semver.pat + 1}`;
    writeVersion(semver);
  });

program
  .command('assets')
  .description('Updates the assets to be included.')
  .argument('<assets...>', 'list of source files and folders')
  .action((assets) => {
    sections[1] = `
\t${pullAssets(assets)
      .flat()
      .map((_) => `"${_}"`)
      .join(',\n\t')}
`;
    writeSW();
  });
program.parse();

function writeAppName(appName) {
  writeSW(sections[0].replace(/appName = '[^']+'/, `appName = '${appName}'`));
}

function writeVersion({ maj, min, pat }) {
  writeSW(
    sections[0].replace(
      /version = '\d+\.\d+\.\d+'/,
      `version = '${maj}.${min}.${pat}'`
    )
  );
}

function pullAssets(assets) {
  return assets.map((asset) => {
    const assetPath = path.join(process.cwd(), asset);
    const stats = statSync(assetPath);

    return stats.isFile()
      ? [asset]
      : readdirSync(assetPath, 'utf8').map((_) => `${asset}/${_}`);
  });
}

function writeSW(sec0 = sections[0]) {
  writeFileSync(filePath, `${sec0}[${sections[1]}]${sections[2]}`, 'utf8');
}
