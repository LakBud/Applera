import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  clean: true,
  sourcemap: true,
  target: 'node24',
  deps: {
    neverBundle: ['node:*'],
  },
});
