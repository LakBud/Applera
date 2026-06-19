import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, mergeConfig } from 'vitest/config';

import viteConfig from './vite.config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const setupCommon = path.resolve(__dirname, './test/setup/common.ts');
const setupMsw = path.resolve(__dirname, './test/setup/msw.ts');

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: [setupCommon],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.d.ts', 'src/main.tsx', 'src/routeTree.gen.ts'],
      },
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            include: ['src/**/*.unit.test.{ts,tsx}'],
          },
        },
        {
          extends: true,
          test: {
            name: 'integration',
            include: ['src/**/*.int.test.{ts,tsx}'],
            // MSW intercepts the network layer for these — see
            // test/setup/msw.ts and test/mocks/handlers.ts.
            setupFiles: [setupCommon, setupMsw],
          },
        },
      ],
    },
  }),
);
