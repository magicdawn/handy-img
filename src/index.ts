import mozjpeg from 'node-mozjpeg'
import sharp from 'sharp'

// decode to metadata or Buffer
export { SharpInput, decode, metadata } from './codec/decode.js'

// high level compress API
export {
  mozjpegCompress,
  sharpAvifCompress,
  sharpJxlCompress,
  sharpMozjpegCompress,
  sharpWebpCompress,
} from './compress.js'
export { mozjpeg, sharp }
