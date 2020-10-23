/// <reference types="node" />
import sharp from 'sharp';
/**
 * get image info
 * @see https://sharp.pixelplumbing.com/api-input#metadata
 *
 * example ret
 * {
 *   format: 'jpeg',
 *   width: 750,
 *   height: 1334,
 *   space: 'srgb',
 *   channels: 3,
 *   depth: 'uchar',
 *   chromaSubsampling: '4:2:0',
 *   isProgressive: true,
 *   hasProfile: false,
 *   hasAlpha: false
 * }
 */
export declare type SharpInput = string | Buffer;
export declare function metadata(input: SharpInput): Promise<sharp.Metadata>;
/**
 * decode img to raw RGB|RGBA pixel data
 */
export declare function decode(input: SharpInput): Promise<{
    data: Buffer;
    width: number;
    height: number;
    channels: number;
}>;
