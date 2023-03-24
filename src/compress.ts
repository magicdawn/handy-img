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

export async function sharpMozjpegCompress(
  file: SharpInput,
  keepMetadata = true,
  options?: sharp.JpegOptions
) {
  let img = sharp(file).jpeg({
    mozjpeg: true,
    ...options,
  })

  if (keepMetadata) {
    img = img.withMetadata()
  }

  const buf = await img.toBuffer()
  return buf
}

export async function sharpWebpCompress(
  file: SharpInput,
  keepMetadata = true,
  options?: sharp.WebpOptions
) {
  let img = sharp(file).webp(options)

  if (keepMetadata) {
    img = img.withMetadata()
  }

  const buf = await img.toBuffer()
  return buf
}
