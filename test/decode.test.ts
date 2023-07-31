import { describe, expect, it } from 'vitest'
import { decode, metadata } from '../src/codec/decode.js'

describe('decode', () => {
  const input = __dirname + '/fixtures/demo.png'

  it('metadata works', async () => {
    const meta = await metadata(input)
    const { format, width, height } = meta

    expect(format).to.equal('png')

    // iPhone 7
    expect(width).to.equal(750)
    expect(height).to.equal(1334)
  })

  it('decode', async () => {
    const decoded = await decode(input)
    const { data, width, height } = decoded

    expect(data).to.instanceOf(Uint8Array)
    expect(data.byteLength).to.gt(0)

    // iPhone 7
    expect(width).to.equal(750)
    expect(height).to.equal(1334)
  })
})
