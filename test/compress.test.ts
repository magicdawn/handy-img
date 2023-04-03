import 'should'
import { metadata } from '../src/codec/decode'
import { mozjpegCompress, sharpMozjpegCompress } from '../src/compress'

describe('compress', () => {
  const input = __dirname + '/fixtures/demo.png'

  it('mozjpegCompress ', async () => {
    const buf = await mozjpegCompress(input)

    // see what's in the compress result
    const meta = await metadata(buf)
    const { format, width, height } = meta

    format!.should.equal('jpeg')

    // iPhone 7
    width!.should.equal(750)
    height!.should.equal(1334)
  })

  it('sharpMozjpegCompress ', async () => {
    const buf = await sharpMozjpegCompress(input)

    // see what's in the compress result
    const meta = await metadata(buf)
    const { format, width, height } = meta

    format!.should.equal('jpeg')

    // iPhone 7
    width!.should.equal(750)
    height!.should.equal(1334)
  })
})
