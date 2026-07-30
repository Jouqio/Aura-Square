import { defineConfig } from 'vitest/config';
import { resolve }      from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include:     ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include:  ['src/engine/**', 'src/utils/**'],
      exclude:  [
        'src/types/**',
        'src/engine/index.ts',
      ],
      thresholds: {
        lines:      95,
        functions:  90,
        branches:   80,
        statements: 95,
      },
    },
  },
  resolve: {
    alias: {
      '@':        resolve(__dirname, 'src'),
      '@engine':  resolve(__dirname, 'src/engine'),
      '@types':   resolve(__dirname, 'src/types'),
      '@utils':   resolve(__dirname, 'src/utils'),
    },
  },
});
