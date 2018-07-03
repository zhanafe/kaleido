const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es6: true,
  },
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 9,
    sourceType: 'module',
    parser: 'babel-eslint',
  },
  rules: {
    'no-console': isProd ? 'error' : 'off',
    'no-debugger': isProd ? 'error' : 'off',
  },
};
