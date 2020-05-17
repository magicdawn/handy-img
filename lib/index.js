const {metadata, decode} = require('./codec/decode')
Object.assign(module.exports, {metadata, decode})

const {encode: mozjpegEncode} = require('./codec/mozjpeg')
exports.mozjpegEncode = mozjpegEncode

const {mozjpegCompress} = require('./compress')
exports.mozjpegCompress = mozjpegCompress
