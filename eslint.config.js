const { fixupConfigRules } = require('@eslint/compat');
const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const expoConfig = require('eslint-config-expo/flat');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');
const globals = require('globals');
const { defineConfig, globalIgnores } = require('eslint/config');

// The Expo flat config already registers the TypeScript parser and plugin for
// TS files, so only add its recommended rules here (re-registering a plugin
// twice is an error in ESLint v10).
const tsRecommendedRules = Object.assign(
  {},
  ...tsPlugin.configs['flat/recommended'].map(({ rules }) => rules ?? {}),
);

module.exports = defineConfig([
  globalIgnores([
    'build/**',
    'docs/**',
    '**/wdyr.ts',
    'testing/**',
    '__mocks__/**',
    'src/grpc/**',
  ]),
  js.configs.recommended,
  // Keep the existing behavior: stale eslint-disable comments are not errors.
  {
    linterOptions: { reportUnusedDisableDirectives: 'off' },
  },
  // Expo's plugins still use a few rule APIs removed in ESLint v10.
  ...fixupConfigRules(expoConfig),
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    plugins: { prettier: prettierPlugin },
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      ...prettierConfig.rules,
      // These joined eslint:recommended in v9/v10; keep the prior baseline.
      'no-constant-binary-expression': 'off',
      'no-useless-assignment': 'off',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'off',
      // Expo's config enables React Compiler-era hooks rules that were not
      // part of the previous setup; keep only rules-of-hooks for now.
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/use-memo': 'off',
      'react-hooks/preserve-manual-memoization': 'off',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/globals': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/error-boundaries': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/set-state-in-render': 'off',
      'react-hooks/unsupported-syntax': 'off',
      'react-hooks/config': 'off',
      'react-hooks/gating': 'off',
      'import/no-named-as-default': 'off',
      'import/no-named-as-default-member': 'off',
    },
    settings: {
      react: { version: 'detect' },
      // 'import/ignore': ['node_modules/react-native/index\\.js$'], doesnt work anymore..?
      'import/ignore': ['react-native'],
      'import/resolver': {
        'babel-module': {},
      },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.d.ts'],
    rules: {
      ...tsRecommendedRules,
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true },
      ],
      // RN does require to load local src
      '@typescript-eslint/no-require-imports': 'off',
      // HACK: i'm too lazy to build bilibili data types so off it goes
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-definitions': 'error',
      // HACK: this is purely for noxplayer ts compatibility.
      // do NOT use ts-ignore for anything else
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
]);
