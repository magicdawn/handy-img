const path = require('path')
const {metadata, decode} = require('../../')

module.exports = {
  command: 'info <file>',
  desc: 'show info for file',
  builder(yargs) {
    return yargs
  },
  handler(argv) {
    return main(argv)
  },
}

async function main(argv) {
  let {file} = argv
  file = path.resolve(file)

  const meta = await metadata(file)
  console.log('metadata: %o', meta)

  const decoded = await decode(file)
  console.log('decoded info: %s', decoded)
}
