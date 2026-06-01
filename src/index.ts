import mozjpeg from 'node-mozjpeg'
import sharp from 'sharp'

// decode to metadata or Buffer
export { decode, metadata, type SharpInput } from './codec/decode'
// high level compress API
export {
  mozjpegCompress,
  sharpAvifCompress,
  sharpJxlCompress,
  sharpMozjpegCompress,
  sharpWebpCompress,
} from './compress'

export * from './util'
export { mozjpeg, sharp }
