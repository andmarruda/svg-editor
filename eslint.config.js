import base from './tooling/eslint-config/index.js';

export default [
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      'docs/api/**',
      'apps/*/dist/**',
      'packages/*/dist/**',
    ],
  },
  ...base,
];
