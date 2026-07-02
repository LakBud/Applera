import * as esbuild from 'esbuild';
import { rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });

await esbuild.build({
  entryPoints: ['src/server.ts'],
  outfile: 'dist/server.mjs',
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node24',
  sourcemap: true,
  packages: 'external',
});
