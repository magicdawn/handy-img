// Node.js
const mozjpegFactory = require('@saschazar/wasm-mozjpeg')
const defaultOptions = require('@saschazar/wasm-mozjpeg/options')

// if this module changes a lot, should switch to squoosh.app
// or create local build here

let mozjpeg
async function init() {
  if (!mozjpeg) {
    mozjpeg = await new Promise((resolve, reject) => {
      const wasm = mozjpegFactory({
        noInitialRun: true,
        onRuntimeInitialized() {
          const {then, ...other} = wasm
          resolve(other)
        },
      })
    })
  }
}

async function encode(data, width, height, options) {
  await init()

  options = Object.assign({}, defaultOptions, options)
  const compressed = await mozjpeg.encode(data, width, height, options)
  mozjpeg.free()

  // compressed is Uint8Array
  const buf = Buffer.from(compressed)
  return buf
}

exports.init = init
exports.encode = encode
