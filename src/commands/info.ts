import path from 'path'
import type {CommandModule} from 'yargs'
import {metadata, decode} from '../'

const cmd: CommandModule = {
  command: 'info <file>',
  aliases: ['i'],
  describe: 'show info for file',
  builder(yargs) {
    return yargs.positional('file', {
      desc: 'the file to view',
      required: true,
      type: 'string',
    })
  },
  handler(argv) {
    return main(argv)
  },
}
export default cmd

async function main(argv) {
  let {file} = argv
  if (file) file = path.resolve(file)

  const meta = await metadata(file)
  console.log('metadata: %o', meta)

  const decoded = await decode(file)
  console.log('decoded info: %s', decoded)
}
