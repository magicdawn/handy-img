import path from 'path'
import { defineConfig, type Options } from 'tsup'

const shared: Options = {
  target: 'node16',
  clean: true,
  shims: true,
  dts: true,
  esbuildOptions(options) {
    options.charset = 'utf8'
    options.external ||= []
    options.external.push(path.join(__dirname, 'package.json'))
  },
}

export default defineConfig([
  {
    ...shared,
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
  },
  {
    ...shared,
    entry: ['src/bin.ts'],
    format: 'esm',
    dts: false,
  },
])
