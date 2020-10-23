import {decode, SharpInput} from './codec/decode'
import {encode as mozjpegEncode, EncodeOptions as MozjpegEncodeOptions} from 'node-mozjpeg'

export async function mozjpegCompress(file: SharpInput, options?: MozjpegEncodeOptions) {
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
