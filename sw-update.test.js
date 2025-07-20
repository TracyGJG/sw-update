import { describe, it, beforeEach, mock } from 'node:test';
import assert from 'node:assert';

import swUtils from './sw-update.js';

const pathMock = mock.fn(() => ({
  join(...pathSections) {
    return pathSections.join('/');
  },
}));
const readdirSyncMock = mock.fn();
const readFileSyncMock = mock.fn();
const statSyncMock = mock.fn();
const writeFileSyncMock = mock.fn();

describe('SW Update', () => {
  let SwUtils;

  beforeEach(() => {
    SwUtils = swUtils('tests/sw.js', {
      path: pathMock,
      readdirSync: readdirSyncMock,
      readFileSync: readFileSyncMock,
      statSync: statSyncMock,
      writeFileSync: writeFileSyncMock,
    });
  });
});
