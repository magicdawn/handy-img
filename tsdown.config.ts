import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/bin.ts'],
  format: 'esm',
  target: 'node22',
  clean: true,
  shims: true,
  dts: true,
  fixedExtension: false,
})
