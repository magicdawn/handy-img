/// <reference types="node" />
import { SharpInput } from './codec/decode';
import { EncodeOptions as MozjpegEncodeOptions } from 'node-mozjpeg';
export declare function mozjpegCompress(file: SharpInput, options?: MozjpegEncodeOptions): Promise<Buffer>;
