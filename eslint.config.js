const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const eslintPluginPrettier = require('eslint-plugin-prettier');
const typescriptEslintParser = require('@typescript-eslint/parser');
const reactRecommended = require('eslint-plugin-react/configs/recommended.js');
const { fixupConfigRules } = require('@eslint/compat');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  js.configs.recommended,
  ...fixupConfigRules(reactRecommended),
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript'
  ),
  { plugins: { prettier: eslintPluginPrettier } },
  {
    settings: {
      react: { version: 'detect' },
      'import/ignore': ['react-native'],
      'import/resolver': { 'babel-module': {} },
    },
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 2017,
        sourceType: 'module',
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'error',
      'react/react-in-jsx-scope': 'off',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'react/display-name': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
    },
  },
  { ignores: ['build/', 'docs/', 'wdyr.ts', 'testing/', '__mocks__/'] },
];
