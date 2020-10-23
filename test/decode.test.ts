import {metadata, decode} from '../lib/codec/decode'

describe('decode', () => {
  const input = __dirname + '/fixtures/demo.png'

  it('metadata works', async () => {
    const meta = await metadata(input)
    const {format, width, height} = meta

    format.should.equal('png')

    // iPhone 7
    width.should.equal(750)
    height.should.equal(1334)
  })

  it('decode', async () => {
    const decoded = await decode(input)
    const {data, width, height} = decoded

    data.should.instanceof(Uint8Array)
    data.byteLength.should.above(0)

    // iPhone 7
    width.should.equal(750)
    height.should.equal(1334)
  })
})
