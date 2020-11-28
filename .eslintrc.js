module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-recommended',
    '@vue/airbnb',
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  ignorePatterns: ['!/.*.js', '!/.*.ts', '*.d.ts'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'max-len': ['error', 120],
    // https://github.com/typescript-eslint/typescript-eslint/issues/2483#issuecomment-687095358
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    // https://github.com/vuejs/eslint-plugin-vue/issues/1347
    'vue/custom-event-name-casing': 'off',
    // fix path alias `/@lib/`
    'import/no-absolute-path': 'off',

    // fix require `.ts` warning which is invalid in ts
    'import/extensions': [
      'error',
      'always',
      {
        ts: 'never',
        js: 'never',
      },
    ],
  },
  plugins: ['import'],
  settings: {
    'import/resolver': {
      node: {
        extensions: [
          '.ts',
        ],
      },
      typescript: {},
    },
  },
  overrides: [
    {
      files: ['*.js', './*.ts'],
      rules: {
        'import/no-extraneous-dependencies': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
};
