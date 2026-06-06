import path from 'node:path'
import { Command, Option, type Usage } from 'clipanion'
import { trim } from 'es-toolkit'
import fse from 'fs-extra'
import logSymbols from 'log-symbols'
import { normalizeInputFileList } from 'mac-helper'
import { matchFromList } from 'needle-kit'
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

  // to escape from Clipanion parsing, use any of these
  // 	-d ' -90'   quote + leading space
  //  -d @-90     @ escape
  degree = Option.String('-d,--degree', { description: 'rotate degree', required: true })

  files = Option.Rest({ name: 'files' })

  static parseDegree(input: string): number {
    input = trim(input, ['@', ' ']) // 负值用 @ escape
    return z.coerce.number().gte(-180).lte(360).parse(input)
  }

  async execute(): Promise<number | void> {
    const inputFiles = await normalizeInputFileList(this.files)
    const imgFiles = await matchFromList(inputFiles, '*.{jpg,jpeg,png,webp,bmp,webp}', {
      caseSensitiveMatch: false,
    })

    const degree = RotateCommand.parseDegree(this.degree)

    for (const f of imgFiles) {
      const dir = path.dirname(f)
      const basename = path.basename(f)
      const extname = path.extname(f)
      const output = this.overwrite ? f : path.join(dir, `${basename}-rotated${extname}`)

      // backup
      const stat = await fse.stat(f)

      // rotate
      const buf = await sharp(f).rotate(degree).keepMetadata().toBuffer()
      await fse.writeFile(output, buf)

      // restore meta
      await fse.chmod(output, stat.mode)
      await fse.utimes(output, stat.atime, stat.mtime)

      console.log(`${logSymbols.success} rotated file written to %s`, output)
    }
  }
}
