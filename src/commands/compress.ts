import path from 'path'
import fse from 'fs-extra'
import {CommandModule} from 'yargs'
import {mozjpegCompress} from '../'

const cmd: CommandModule = {
  command: 'compress <file>',
  aliases: ['c'],
  describe: 'compress file',
  builder(yargs) {
    return yargs
      .positional('file', {
        type: 'string',
        desc: 'file to be processed',
      })
      .options({
        output: {
          type: 'string',
          desc: 'output file',
          alias: 'o',
        },
      })
  },
  handler(argv) {
    return main(argv)
  },
}

export default cmd

async function main(argv) {
  let {file} = argv as {file: string}
  file = path.resolve(file)

  let output = argv.output
  if (!output) {
    const inputExt = path.extname(file)
    const inputBase = path.basename(file, inputExt)
    output = inputBase + '_compressed.jpeg'
  }
  output = path.resolve(output)

  const buf = await mozjpegCompress(file)
  await fse.writeFile(output, buf)
  console.log('[success] write to %s', output)
}
