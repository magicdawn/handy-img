import NodeMozjpeg, { type EncodeOptions as MozjpegEncodeOptions } from 'node-mozjpeg'
import sharp from 'sharp'
import { decode, SharpInput } from './codec/decode.js'

const { encode: mozjpegEncode } = NodeMozjpeg

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
  options?: sharp.JpegOptions,
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

function sharpTargetFormatFactory<T extends 'webp' | 'avif' | 'jxl'>(
  targetFormat: 'webp' | 'avif' | 'jxl',
) {
  type IOptions = T extends 'webp'
    ? sharp.WebpOptions
    : T extends 'avif'
      ? sharp.AvifOptions
      : sharp.JxlOptions

  return async function sharpCompressToFormat(
    file: SharpInput,
    keepMetadata = true,
    options?: IOptions,
  ) {
    let img = sharp(file)[targetFormat](options)

    if (keepMetadata) {
      img = img.withMetadata()
    }

    const buf = await img.toBuffer()
    return buf
  }
}

// webp
export const sharpWebpCompress = sharpTargetFormatFactory<'webp'>('webp')

// avif
export const sharpAvifCompress = sharpTargetFormatFactory<'avif'>('avif')

// jxl: require custom libvips compiled with support for libjxl
export const sharpJxlCompress = sharpTargetFormatFactory<'jxl'>('jxl')
