import { encode as mozjpegEncode, EncodeOptions as MozjpegEncodeOptions } from 'node-mozjpeg'
import sharp from 'sharp'
import { decode, SharpInput } from './codec/decode'

export async function mozjpegCompress(file: SharpInput, options?: Partial<MozjpegEncodeOptions>) {
  if (!file) {
    throw new Error('file is required')
  }

  // decode
  const decoded = await decode(file)
  const { data, width, height } = decoded

  // encode
  const bufEncoded = await mozjpegEncode(data, width, height, options)
  return bufEncoded
}

export async function sharpWebp(
  file: SharpInput,
  keepMetadata = true,
  options?: sharp.WebpOptions
) {
  let img = sharp(file).webp(options)

  if (keepMetadata) {
    img = img.withMetadata()
  }

  const { data } = await img.toBuffer({ resolveWithObject: true })
  return data
}
