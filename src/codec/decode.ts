import sharp from 'sharp'

/**
 * sharp(input: SharpInput)
 */
export type SharpInput = NonNullable<Parameters<typeof sharp>[0]>

/**
 * get image metadata
 * @see https://sharp.pixelplumbing.com/api-input#metadata
 */
export async function metadata(input: SharpInput) {
  const meta = await sharp(input).metadata()
  return meta
}

/**
 * decode img to raw RGB|RGBA pixel data
 */
export async function decode(input: SharpInput) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  // data is Buffer, data.buffer is ArrayBuffer
  // const uarr = new Uint8Array(data.buffer)

  // example info
  // info: {
  //   format: 'raw',
  //   width: 750,
  //   height: 1334,
  //   channels: 3,
  //   premultiplied: false,
  //   size: 3001500
  // }
  const { width, height, channels } = info
  return { data, width, height, channels }
}
