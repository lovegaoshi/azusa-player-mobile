const path = require('path');

module.exports = {
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
          '@utils': './src/utils',
          '@hooks': './src/hooks',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
