// decode to metadata or Buffer
export { decode, metadata } from './codec/decode'

// high level compress API
export {
  mozjpegCompress,
  sharpAvifCompress,
  sharpJxlCompress,
  sharpMozjpegCompress,
  sharpWebpCompress,
} from './compress'
export * from './util'

// re-export
export { default as mozjpeg } from 'node-mozjpeg'
export { default as sharp } from 'sharp'
export type { SharpInput } from 'sharp'
