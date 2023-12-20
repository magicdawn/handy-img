import path from 'path'
import { describe, expect, it } from 'vitest'
import { metadata } from '../src/codec/decode.js'
import { mozjpegCompress, sharpMozjpegCompress } from '../src/compress.js'

describe('compress', () => {
  const input = __dirname + '/fixtures/demo.png'

  it('mozjpegCompress ', async () => {
    const buf = await mozjpegCompress(input)

    // see what's in the compress result
    const meta = await metadata(buf)
    const { format, width, height } = meta

    expect(format).to.equal('jpeg')

    // iPhone 7
    expect(width).to.equal(750)
    expect(height).to.equal(1334)
  })

  it('sharpMozjpegCompress ', async () => {
    const buf = await sharpMozjpegCompress(input)

    // see what's in the compress result
    const meta = await metadata(buf)
    const { format, width, height } = meta

    expect(format).to.equal('jpeg')

    // iPhone 7
    expect(width).to.equal(750)
    expect(height).to.equal(1334)
  })

  it('.bmp as input should be ok', async () => {
    const input = path.join(__dirname, './fixtures/dots.bmp')
    const buf = await sharpMozjpegCompress(input)
    expect(buf).toBeInstanceOf(Buffer)
  })
})
