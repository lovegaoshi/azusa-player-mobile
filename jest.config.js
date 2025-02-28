const esModules = [
  'query-string',
  'split-on-first',
  'filter-obj',
  '@react-native',
  'react-native',
  'decode-uri-component',
  'libmuse',
  'lodash',
  'youtubei',
  'jintr',
].join('|');

const config = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: { '^.+\\.(js|jsx)$': 'babel-jest' },
  //................
  moduleNameMapper: {
    // Force module uuid to resolve with the CJS entry point, because Jest does not support package.json.exports. See https://github.com/uuidjs/uuid/issues/451
    uuid: require.resolve('uuid'),
  },

  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
};

module.exports = config;
