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
        [
          'module-resolver',
          {
            root: ['./src'],
            extensions: ['.tsx', '.ts', '.js', '.json'],
            alias: {
              tests: ['./tests/'],
              '@components': './src/components',
              '@utils': './src/utils',
              '@enums': './src/enums',
              '@objects': './src/objects',
              '@services': './src/services',
              '@stores': './src/stores',
              '@hooks': './src/hooks',
              '@assets': './src/assets',
              '@mfsdk': './MusicFreePlugins/dist',
            },
          },
        ],
        'react-native-reanimated/plugin',
        [
          '@babel/plugin-syntax-import-attributes',
          {
            deprecatedAssertSyntax: true,
          },
        ],
      ],
    };
  }
  return {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.tsx', '.ts', '.js', '.json'],
          alias: {
            tests: ['./tests/'],
            '@components': './src/components',
            '@types': './src/types',
            '@utils': './src/utils',
            '@enums': './src/enums',
            '@objects': './src/objects',
            '@services': './src/services',
            '@stores': './src/stores',
            '@hooks': './src/hooks',
            '@assets': './src/assets',
            '@mfsdk': './MusicFreePlugins/dist',
          },
        },
      ],
      'react-native-reanimated/plugin',
      ['@babel/plugin-transform-private-methods', { loose: true }],
    ],
  };
};
