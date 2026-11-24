const workletsPluginOptions = {
  bundleMode: true,
  strictGlobal: true, // optional, but recommended
};

module.exports = api => {
  const isTest = api.env('test');
  if (isTest) {
    return {
      presets: [
        'module:@react-native/babel-preset',
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript',
      ],
      plugins: [
        ['module:react-native-dotenv'],
        [
          'module-resolver',
          {
            root: ['./src'],
            extensions: ['.tsx', '.ts', '.js', '.json'],
            alias: {
              tests: ['./tests/'],
              '@components': './src/components',
              '@utils': './src/utils',
              '@specs': './specs',
              '@enums': './src/enums',
              '@objects': './src/objects',
              '@services': './src/services',
              '@stores': './src/stores',
              '@hooks': './src/hooks',
              '@assets': './src/assets',
            },
          },
        ],
        ['react-native-worklets/plugin', workletsPluginOptions],
        '@babel/plugin-transform-export-namespace-from',
        [
          '@babel/plugin-syntax-import-attributes',
          {
            deprecatedAssertSyntax: true,
          },
        ],
        'babel-plugin-transform-import-meta',
      ],
    };
  }
  return {
    env: {
      production: {
        plugins: ['transform-remove-console'],
      },
    },
    presets: [
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true,
          // Metro's React Native default transformer passes no `engine` to
          // Babel, so babel-preset-expo falls back to the legacy "default"
          // (hermes-v0) profile: classes, static blocks, private members and
          // computed keys are all lowered to ES5. Expo's transformer forwards
          // `engine: hermes` from Expo CLI, which selects the hermes-v1
          // profile instead. That profile preserves modern syntax that Hermes
          // cannot compile, surfacing as
          // "Invalid property name - must be a string, number or identifier".
          // Pin the profile so both transformers emit the same bytecode-safe
          // JavaScript.
          unstable_transformProfile: 'hermes-v0',
        },
      ],
    ],
    plugins: [
      ['module:react-native-dotenv'],
      ['inline-import', { extensions: ['.sql'] }],
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.tsx', '.ts', '.js', '.json'],
          alias: {
            tests: ['./tests/'],
            '@components': './src/components',
            '@specs': './specs',
            '@types': './src/types',
            '@utils': './src/utils',
            '@contexts': './src/contexts',
            '@enums': './src/enums',
            '@objects': './src/objects',
            '@services': './src/services',
            '@stores': './src/stores',
            '@hooks': './src/hooks',
            '@assets': './src/assets',
          },
        },
      ],
      'react-native-worklets/plugin',
      ['@babel/plugin-transform-private-methods', { loose: true }],
    ],
  };
};
