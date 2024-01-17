module.exports = {
  root: true,
  env: { es2020: true, browser: false },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  rules: {
    'prefer-const': 'off',
  },
}
