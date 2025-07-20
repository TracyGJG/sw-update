export default function swUtils(
  filePath,
  { path, readdirSync, readFileSync, statSync, writeFileSync }
) {
  let sections;
  let semver;

  extractSections(readFileSync(filePath, 'utf8'));

  return {
    writeApplicationName,
    updateMajorSemver,
    updateMinorSemver,
    updatePatchSemver,
    processAssets,
  };

  function extractSections(sw) {
    sections = sw.split(/[\[\]]/);
    semver = sections[0].match(
      /const version = '(?<maj>\d+)\.(?<min>\d+)\.(?<pat>\d+)'/
    ).groups;
  }

  function writeApplicationName(appName) {
    writeSW(sections[0].replace(/appName = '[^']*'/, `appName = '${appName}'`));
  }

  function updateMajorSemver() {
    semver.maj = `${+semver.maj + 1}`;
    semver.min = `0`;
    semver.pat = `0`;
    writeVersion(semver);
  }

  function updateMinorSemver() {
    semver.min = `${+semver.min + 1}`;
    semver.pat = `0`;
    writeVersion(semver);
  }

  function updatePatchSemver() {
    semver.pat = `${+semver.pat + 1}`;
    writeVersion(semver);
  }

  function writeVersion({ maj, min, pat }) {
    writeSW(
      sections[0].replace(
        /version = '\d+\.\d+\.\d+'/,
        `version = '${maj}.${min}.${pat}'`
      )
    );
  }

  function processAssets(assets) {
    sections[1] = `
\t${pullAssets(assets)
      .flat()
      .map((_) => `"${_}"`)
      .join(',\n\t')}
`;
    writeSW();
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
}
