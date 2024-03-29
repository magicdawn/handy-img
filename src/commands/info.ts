import { Command, Option, Usage } from 'clipanion'
import exifr from 'exifr'
import path from 'path'
import { decode, metadata } from '../index.js'

export class InfoCommand extends Command {
  static paths = [['info'], ['i']]

  static usage: Usage = {
    description: 'show info for file',
  }

  file = Option.String({ required: true })

  verbose = Option.Boolean('-v,--verbose', false, {
    description: 'show verbose info',
  })

  execute(): Promise<number | void> {
    return main(this)
  }
}

export async function main({ file, verbose }: { file: string; verbose: boolean }) {
  if (file) file = path.resolve(file)

  const meta = await metadata(file)
  console.log('\nmetadata: %o', meta)

  const decoded = await decode(file)
  console.log('\n\ndecoded info: %s', decoded)

  const _orientation = await exifr.orientation(file)
  console.log('\n\nexifr orientation: %o', _orientation)

  if (verbose) {
    const all = await exifr.parse(file, {
      tiff: true,
      ifd1: true,
      mergeOutput: true,
      translateValues: false,
    })
    console.log('\n\nexifr all: ', all)
  }
}
