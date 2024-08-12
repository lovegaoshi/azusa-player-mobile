/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withSentryConfig } = require('@sentry/react-native/metro');

const config = { unstable_enablePackageExports: true };

module.exports = withSentryConfig(
  mergeConfig(getDefaultConfig(__dirname), config)
);
