import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    exclude: ['tests/css-purge-test.js', 'tests/lightning-css-purge-test.js'],
  },
});