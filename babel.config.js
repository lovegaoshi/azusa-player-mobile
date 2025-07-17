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
        'react-native-reanimated/plugin',
        '@babel/plugin-transform-export-namespace-from',
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
    presets: [
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
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
      'react-native-reanimated/plugin',
      ['@babel/plugin-transform-private-methods', { loose: true }],
    ],
  };
};
