import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const setupEnv = path.resolve(__dirname, './test/setup/env.ts');
const setupMongo = path.resolve(__dirname, './test/setup/mongo.ts');

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [setupEnv],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/server.ts', 'src/types/**'],
    },
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.unit.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: ['src/**/*.int.test.ts'],
          testTimeout: 30000,
          hookTimeout: 30000,
          fileParallelism: false,
          setupFiles: [setupEnv, setupMongo],
        },
      },
    ],
  },
});
