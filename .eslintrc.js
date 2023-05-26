module.exports = {
  root: true,
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:react-hooks/recommended',
    'plugin:prettier/recommended',
    './node_modules/gts/',
  ],
  parserOptions: {
    ecmaVersion: 2017, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  plugins: ['prettier'],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    '@typescript-eslint/consistent-type-definitions': 'error',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },
};
