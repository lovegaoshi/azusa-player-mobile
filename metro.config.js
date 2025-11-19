/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withSentryConfig } = require('@sentry/react-native/metro');
const path = require('path');

const RNTPPath = path.resolve(__dirname, '../react-native-track-player');
const pak = require(`${RNTPPath}/package.json`);
const modules = Object.keys({
  ...pak.peerDependencies,
});
/** build the blockList **/
const blockList = modules.map(
  m => new RegExp(`^${escape(path.join(RNTPPath, 'node_modules', m))}\\/.*$`),
);

/** build extraNodeModules **/
const extraNodeModules = modules.reduce((acc, name) => {
  acc[name] = path.join(__dirname, 'node_modules', name);
  return acc;
}, {});

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('sql');

const customConfig = {
  watchFolders: [
    __dirname,
    path.resolve(__dirname, '../react-native-track-player'),
  ],
  resolver: {
    blockList,
    extraNodeModules,
    nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
    // HACK: only enables this if some module is only commonJS
    // unstable_enablePackageExports: false,
  },
};

module.exports = withSentryConfig(mergeConfig(config, customConfig));
