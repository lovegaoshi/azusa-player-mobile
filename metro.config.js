/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);
const rnconfig = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('sql');
// expo metro does not respect disabled auto linking
// something must be going on here as setting to the serialized object wont work
config.transformer = rnconfig.transformer;

module.exports = config; //mergeConfig(rnconfig, config);
