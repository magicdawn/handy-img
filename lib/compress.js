const {decode} = require('./codec/decode')
const {encode: mozjpegEncode} = require('./codec/mozjpeg')

exports.mozjpegCompress = async function mozjpegCompress(file, options) {
  if (!file) {
    throw new Error('file is required')
  }

  // decode
  const decoded = await decode(file)
  const {data, width, height} = decoded

  // encode
  const bufEncoded = await mozjpegEncode(data, width, height, options)
  return bufEncoded
}
