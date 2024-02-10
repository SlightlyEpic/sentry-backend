module.exports = {
  root: true,
  env: { es2020: true, browser: false },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.js'],
  parser: '@typescript-eslint/parser',
  plugins: [
    "@typescript-eslint"
  ],
  rules: {
    'prefer-const': 'off',
    'semi': 'error',
    'indent': ['error', 4],
    'quotes': ['error', 'single'],
    '@typescript-eslint/no-explicit-any': 'off'
  },
}
