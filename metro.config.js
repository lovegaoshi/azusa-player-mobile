/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const { getDefaultConfig } = require('@react-native/metro-config');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);
const rnconfig = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('sql');
// expo metro does not respect disabled auto linking
// something must be going on here as setting to the serialized object wont work
config.transformer = rnconfig.transformer;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@react-native-masked-view/masked-view')) {
    // Logic to resolve the module name to a file path...
    // NOTE: Throw an error if there is no resolution.
    return context.resolveRequest(
      context,
      '@expo/ui/community/masked-view',
      platform,
    );
  }

  // Ensure you call the default resolver.
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
