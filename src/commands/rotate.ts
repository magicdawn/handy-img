import path from 'node:path'
import { Command, Option, type Usage } from 'clipanion'
import fg from 'fast-glob'
import fse from 'fs-extra'
import logSymbols from 'log-symbols'
import { PathFinder } from 'mac-helper'
import micromatch from 'micromatch'
import { isFile } from 'path-type'
import sharp from 'sharp'
import { z } from 'zod'

export class RotateCommand extends Command {
  static override paths = [['rotate'], ['r']]

  static override usage: Usage = {
    description: 'rotate img',
  }

  overwrite = Option.Boolean('-o,--overwrite', false, {
    description: 'overwrite input files',
  })

  degree = Option.String('-d,--degree', {
    description: 'rotate degree',
    required: true,
  })

  files = Option.Rest({
    name: 'files',
  })

  async execute(): Promise<number | void> {
    const degree = z.coerce.number().gt(0).lte(360).parse(this.degree)

    const input: string[] = []
    for (const f of this.files) {
      if (f === '$PF') {
        input.push(...(await PathFinder.allSelected()))
      } else {
        input.push(path.resolve(f))
      }
    }

    const pattern = './**/*.{jpg,jpeg,png,webp,bmp,webp}'
    const isImg = (p: string) => micromatch([p], pattern, { nocase: true }).length > 0

    const inputFiles: string[] = []
    for (const item of input) {
      if (await isFile(item)) {
        if (isImg(item)) {
          inputFiles.push(item)
        }
      } else {
        inputFiles.push(
          ...(await fg(pattern, {
            cwd: item,
            absolute: true,
            onlyFiles: true,
            caseSensitiveMatch: false,
          })),
        )
      }
    }

    for (const f of inputFiles) {
      const dir = path.dirname(f)
      const basename = path.basename(f)
      const extname = path.extname(f)
      const output = this.overwrite ? f : path.join(dir, `${basename}-rotated${extname}`)
      const buf = await sharp(f).rotate(degree).keepMetadata().toBuffer()
      await fse.writeFile(output, buf)
      console.log(`${logSymbols.success} rotated file written to %s`, output)
    }
  }
}
