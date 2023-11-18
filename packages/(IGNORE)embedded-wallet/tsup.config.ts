// import path from "path";
// import fsPromises from "fs/promises";
import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
  entry: ['src/index.ts'],
  outDir: 'dist',
  splitting: false,
  sourcemap: true,
  treeshake: true,
  clean: true,
  bundle: true,
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  minify: !options.watch,
  dts: true,
  platform: 'browser',
  format: ['cjs', 'esm']
}))
