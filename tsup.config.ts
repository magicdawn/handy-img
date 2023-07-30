import $esm from 'esm-utils'
import path from 'path'
import { defineConfig } from 'tsup'

const { __dirname } = $esm(import.meta)
const prod = process.env.NODE_ENV === 'production'

export default defineConfig((options) => ({
  entry: ['src/bin.ts', 'src/index.ts'],
  target: 'node16',
  // format: ['esm', 'cjs'], import.meta not available in cjs
  format: 'esm',
  clean: true,
  dts: prod,
  esbuildOptions(options) {
    options.charset = 'utf8'
    options.external ||= []
    options.external.push(path.join(__dirname, 'package.json'))
  },
}))
