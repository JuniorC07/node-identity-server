import * as dotenv from 'dotenv';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

dotenv.config({
  path: resolve(import.meta.dirname, '.env.test'),
  override: true,
  quiet: true,
});

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },

  test: {
    environment: 'node',
    exclude: ['dist/**', 'node_modules/**'],
    fileParallelism: false,
    globalSetup: ['./tests/globalSetup.ts'],
    env: {
      NODE_ENV: 'test',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
