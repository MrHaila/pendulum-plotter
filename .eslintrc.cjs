/* eslint-env node */
require('@vue/eslint-config-typescript')
require('@vue/eslint-config-prettier')

module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    semi: ['error', 'never'],
    'comma-dangle': ['error', 'always-multiline'],
  },
}
