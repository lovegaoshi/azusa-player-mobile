/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withSentryConfig } = require('@sentry/react-native/metro');

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('sql');
const customConfig = {};

module.exports = withSentryConfig(mergeConfig(config, customConfig));
