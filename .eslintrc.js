module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  settings: {
    'import/extensions': ['.js', '.ts'],
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    'no-console': 0,
    'no-underscore-dangle': ['error', { allow: ['_id'] }],
    'no-use-before-define': 0,
    '@typescript-eslint/no-use-before-define': ['error', {
      ignoreTypeReferences: true,
      functions: false,
      classes: false,
    }],
    'no-shadow': 0,
    '@typescript-eslint/no-shadow': 1,
    semi: 'off',
    '@typescript-eslint/semi': ['error'],
  },
};
