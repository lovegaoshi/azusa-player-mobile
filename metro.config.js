/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const { getSentryExpoConfig } = require('@sentry/react-native/metro');
const {
  getBundleModeMetroConfig,
} = require('react-native-worklets/bundleMode');

const config = getBundleModeMetroConfig(getSentryExpoConfig(__dirname));
config.resolver.sourceExts.push('sql');

// Expo's transformer defaults to `experimentalImportSupport: true`, which
// tells Babel to leave ESM import/export syntax in the modules it hands to
// Metro. React Native's default transformer keeps that disabled and emits
// CommonJS instead. Keep the Expo transformer (Expo's serializer and the
// worklets bundle-mode integration depend on it), but use the same transform
// options as the known-good React Native setup so Hermes receives equivalent
// code. `inlineRequires: true` is preserved by getBundleModeMetroConfig.
const getTransformOptions = config.transformer.getTransformOptions;
config.transformer.getTransformOptions = async (...args) => {
  const options = await getTransformOptions(...args);
  return {
    ...options,
    transform: {
      ...options.transform,
      experimentalImportSupport: false,
    },
  };
};

module.exports = config;
