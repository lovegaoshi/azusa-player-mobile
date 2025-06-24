import { Innertube } from 'youtubei.js';

// HACK: generic jest mock to get around expo sqlite

jest.mock('./src/utils/db/sqlAPI', () => ({
  exportSQL: jest.fn(() => {}),
  getSyncABRepeatR128: jest.fn(() => []),
}));

jest.mock('./src/utils/db/migration', () => ({}));

jest.mock('./src/utils/db/sqlStorage', () => ({
  restoreR128Gain: () => jest.fn(() => {}),
  restoreABRepeat: () => jest.fn(() => {}),
}));
