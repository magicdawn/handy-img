import {mozjpegCompress} from '../lib/compress'
import {metadata} from '../lib/codec/decode'

describe('compress', () => {
  const input = __dirname + '/fixtures/demo.png'

  it('mozjpegCompress ', async () => {
    const buf = await mozjpegCompress(input)

    // see what's in the compress result
    const meta = await metadata(buf)
    const {format, width, height} = meta

    format.should.equal('jpeg')

    // iPhone 7
    width.should.equal(750)
    height.should.equal(1334)
  })
})
