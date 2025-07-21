import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';

import SW_UTILS from './sw-update.js';

const pathMock = {
  join: mock.fn((...pathSections) => pathSections.join('/')),
};
const readdirSyncMock = mock.fn((_) => ['test3.txt', 'test4.txt']);
const readFileSyncMock = mock.fn(() => {
  return `
const appName = '_';
const version = '0.0.0';
const staticCacheName = '\${appName}_\${version}';
SECTION ONE

const staticAssets = [];

SECTION THREE
`;
});
const statSyncMock = mock.fn((asset) => ({
  isFile() {
    return asset.at(-1) !== '/';
  },
}));
const writeFileSyncMock = mock.fn((_) => _);

describe('SW Update', () => {
  let SwUtils;

  before(() => {
    SwUtils = SW_UTILS('tests/sw.js', {
      path: pathMock,
      readdirSync: readdirSyncMock,
      readFileSync: readFileSyncMock,
      statSync: statSyncMock,
      writeFileSync: writeFileSyncMock,
    });
  });

  it('reveals the module interface', () => {
    assert.equal(Object.keys(SwUtils).length, 5);
    assert.ok(SwUtils.writeApplicationName);
    assert.ok(SwUtils.updateMajorSemver);
    assert.ok(SwUtils.updateMinorSemver);
    assert.ok(SwUtils.updatePatchSemver);
    assert.ok(SwUtils.processAssets);

    assert.strictEqual(readFileSyncMock.mock.callCount(), 1);
    assert.deepStrictEqual(readFileSyncMock.mock.calls[0].arguments, [
      'tests/sw.js',
      'utf8',
    ]);
    assert.strictEqual(writeFileSyncMock.mock.callCount(), 0);
  });

  it('facilitates updating the appName property', () => {
    assert.strictEqual(writeFileSyncMock.mock.callCount(), 0);

    SwUtils.writeApplicationName('testApp');

    assert.strictEqual(writeFileSyncMock.mock.callCount(), 1);

    assert.deepStrictEqual(writeFileSyncMock.mock.calls[0].arguments, [
      'tests/sw.js',
      '\n' +
        "const appName = 'testApp';\n" +
        "const version = '0.0.0';\n" +
        "const staticCacheName = '${appName}_${version}';\n" +
        'SECTION ONE\n' +
        '\n' +
        'const staticAssets = [];\n' +
        '\n' +
        'SECTION THREE\n',
      'utf8',
    ]);
  });

  it('facilitates updating the semver property (patch)', () => {
    assert.strictEqual(writeFileSyncMock.mock.callCount(), 1);

    SwUtils.updatePatchSemver();

    assert.strictEqual(writeFileSyncMock.mock.callCount(), 2);

    assert.deepStrictEqual(writeFileSyncMock.mock.calls[1].arguments, [
      'tests/sw.js',
      '\n' +
        "const appName = '_';\n" +
        "const version = '0.0.1';\n" +
        "const staticCacheName = '${appName}_${version}';\n" +
        'SECTION ONE\n' +
        '\n' +
        'const staticAssets = [];\n' +
        '\n' +
        'SECTION THREE\n',
      'utf8',
    ]);
  });

  it('facilitates updating the semver property (minor)', () => {
    assert.strictEqual(writeFileSyncMock.mock.callCount(), 2);

    SwUtils.updateMinorSemver();

    assert.strictEqual(writeFileSyncMock.mock.callCount(), 3);

    assert.deepStrictEqual(writeFileSyncMock.mock.calls[2].arguments, [
      'tests/sw.js',
      '\n' +
        "const appName = '_';\n" +
        "const version = '0.1.0';\n" +
        "const staticCacheName = '${appName}_${version}';\n" +
        'SECTION ONE\n' +
        '\n' +
        'const staticAssets = [];\n' +
        '\n' +
        'SECTION THREE\n',
      'utf8',
    ]);
  });

  it('facilitates updating the semver property (major)', () => {
    assert.strictEqual(writeFileSyncMock.mock.callCount(), 3);

    SwUtils.updateMajorSemver();

    assert.strictEqual(writeFileSyncMock.mock.callCount(), 4);

    assert.deepStrictEqual(writeFileSyncMock.mock.calls[3].arguments, [
      'tests/sw.js',
      '\n' +
        "const appName = '_';\n" +
        "const version = '1.0.0';\n" +
        "const staticCacheName = '${appName}_${version}';\n" +
        'SECTION ONE\n' +
        '\n' +
        'const staticAssets = [];\n' +
        '\n' +
        'SECTION THREE\n',
      'utf8',
    ]);
  });

  it('facilitates updating the assets (no assets)', () => {
    assert.strictEqual(writeFileSyncMock.mock.callCount(), 4);

    SwUtils.processAssets();

    assert.strictEqual(writeFileSyncMock.mock.callCount(), 5);

    assert.deepStrictEqual(writeFileSyncMock.mock.calls[4].arguments, [
      'tests/sw.js',
      '\n' +
        "const appName = '_';\n" +
        "const version = '0.0.0';\n" +
        "const staticCacheName = '${appName}_${version}';\n" +
        'SECTION ONE\n' +
        '\n' +
        'const staticAssets = [\n' +
        '  \t\n' +
        '  ];\n' +
        '\n' +
        'SECTION THREE\n',
      'utf8',
    ]);
  });

  it('facilitates updating the assets (files only)', () => {
    assert.strictEqual(writeFileSyncMock.mock.callCount(), 5);

    SwUtils.processAssets(['/test1.txt', '/test2.txt']);

    assert.strictEqual(writeFileSyncMock.mock.callCount(), 6);

    assert.deepStrictEqual(writeFileSyncMock.mock.calls[5].arguments, [
      'tests/sw.js',
      '\n' +
        "const appName = '_';\n" +
        "const version = '0.0.0';\n" +
        "const staticCacheName = '${appName}_${version}';\n" +
        'SECTION ONE\n' +
        '\n' +
        'const staticAssets = [\n' +
        '  \t"/test1.txt",\n' +
        '\t"/test2.txt"\n' +
        '  ];\n' +
        '\n' +
        'SECTION THREE\n',
      'utf8',
    ]);
  });

  it('facilitates updating the assets (folder only)', () => {
    assert.strictEqual(writeFileSyncMock.mock.callCount(), 6);

    SwUtils.processAssets(['/tests/']);

    assert.strictEqual(writeFileSyncMock.mock.callCount(), 7);

    assert.deepStrictEqual(writeFileSyncMock.mock.calls[6].arguments, [
      'tests/sw.js',
      '\n' +
        "const appName = '_';\n" +
        "const version = '0.0.0';\n" +
        "const staticCacheName = '${appName}_${version}';\n" +
        'SECTION ONE\n' +
        '\n' +
        'const staticAssets = [\n' +
        '  \t"/tests/test3.txt",\n' +
        '\t"/tests/test4.txt"\n' +
        '  ];\n' +
        '\n' +
        'SECTION THREE\n',
      'utf8',
    ]);
  });

  it('facilitates updating the assets (files and folder)', () => {
    assert.strictEqual(writeFileSyncMock.mock.callCount(), 7);

    SwUtils.processAssets(['/test1.txt', '/test2.txt', '/tests/']);

    assert.strictEqual(writeFileSyncMock.mock.callCount(), 8);

    assert.deepStrictEqual(writeFileSyncMock.mock.calls[7].arguments, [
      'tests/sw.js',
      '\n' +
        "const appName = '_';\n" +
        "const version = '0.0.0';\n" +
        "const staticCacheName = '${appName}_${version}';\n" +
        'SECTION ONE\n' +
        '\n' +
        'const staticAssets = [\n' +
        '  \t"/test1.txt",\n' +
        '\t"/test2.txt",\n' +
        '\t"/tests/test3.txt",\n' +
        '\t"/tests/test4.txt"\n' +
        '  ];\n' +
        '\n' +
        'SECTION THREE\n',
      'utf8',
    ]);
  });
});
