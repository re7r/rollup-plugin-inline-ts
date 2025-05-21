import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'tsdown';

export default defineConfig({
  external: ['esbuild', 'typescript', '@swc/core', 'oxc-transform'],
  entry: ['./src/index.ts'],
  platform: 'node',
  minify: true,
  hooks: {
    'build:done': function () {
      const file = join(__dirname, 'dist/index.d.ts');
      const code = readFileSync(file, 'utf8');
      const cleaned = code.replaceAll(/\/\/#region.*\n?/g, '').replaceAll(/\/\/#endregion.*\n?/g, '');
      writeFileSync(file, cleaned);
    },
  },
});
