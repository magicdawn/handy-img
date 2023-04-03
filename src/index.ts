import mozjpeg from 'node-mozjpeg'
import sharp from 'sharp'

// decode to metadata or Buffer
export { SharpInput, decode, metadata } from './codec/decode'
// high level compress API
export { mozjpegCompress, sharpMozjpegCompress, sharpWebpCompress } from './compress'
export { sharp, mozjpeg }
