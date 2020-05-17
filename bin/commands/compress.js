const path = require('path')
const fse = require('fs-extra')
const {mozjpegCompress} = require('../../')

module.exports = {
  command: 'compress <file> [options]',
  desc: 'show info for file',
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
          alias: ['o'],
        },
      })
  },
  handler(argv) {
    return main(argv)
  },
}

async function main(argv) {
  let {file} = argv
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
