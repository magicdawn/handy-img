import * as bmp from '@vingle/bmp-js'
import { readFile } from 'fs/promises'
import NodeMozjpeg, { type EncodeOptions as MozjpegEncodeOptions } from 'node-mozjpeg'
import path from 'path'
import sharp, { Sharp } from 'sharp'
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

/**
 * bmp support
 * @see https://github.com/lovell/sharp/issues/806#issuecomment-419661745
 */

const BUF_BMP = Buffer.from([0x42, 0x4d]) // "BM" file signature

function isBitmap(buf: Buffer): boolean {
  return Buffer.compare(BUF_BMP, buf.slice(0, 2)) === 0
}

const handleBmp = (buf: Buffer) => {
  const bitmap = bmp.decode(buf, true)
  return sharp(bitmap.data, {
    raw: {
      width: bitmap.width,
      height: bitmap.height,
      channels: 4,
    },
  })
}

async function getSharpInstance(input: SharpInput): Promise<Sharp> {
  // bmp
  if (typeof input === 'string') {
    if (path.extname(input).toLowerCase() === '.bmp') {
      const buf = await readFile(input)
      if (isBitmap(buf)) {
        return handleBmp(buf)
      }
    }
  }
  if (Buffer.isBuffer(input)) {
    if (isBitmap(input)) {
      return handleBmp(input)
    }
  }

  return sharp(input)
}

export async function sharpMozjpegCompress(
  file: SharpInput,
  keepMetadata = true,
  options?: sharp.JpegOptions,
) {
  let img = (await getSharpInstance(file)).jpeg({
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
    let img = (await getSharpInstance(file))[targetFormat](options)

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
