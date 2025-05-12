import mozjpeg from 'node-mozjpeg'
import sharp from 'sharp'

// decode to metadata or Buffer
export { decode, metadata, SharpInput } from './codec/decode.js'
export * from './util.js'

// high level compress API
export {
  mozjpegCompress,
  sharpAvifCompress,
  sharpJxlCompress,
  sharpMozjpegCompress,
  sharpWebpCompress,
} from './compress.js'
export { mozjpeg, sharp }
