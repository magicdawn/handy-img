import { BaseCommand, getFilenameTokens, renderFilenameTokens } from '@magicdawn/x-args'
import { Command, Option, Usage } from 'clipanion'
import fse from 'fs-extra'
import path from 'path'
import { mozjpegCompress } from '../'
import globby from 'globby'
import * as t from 'typanion'
import chalk from 'chalk'
import { printFilenameTokens } from '@magicdawn/x-args'
import { sharpWebp } from '../compress'
import bytes from 'bytes'
import pmap from 'promise.map'

//
// --codec
// mozjpeg
// webp
//
// -d dir
// -o output

type Codec = 'mozjpeg' | 'webp'

export class CompressCommand extends Command {
  static paths = [['compress'], ['c']]

  static usage: Usage = {
    description: 'compress img',
  }

  /**
   * glob
   */
  files = Option.String('-f,--files', {
    required: true,
    description: 'files as input',
  })
  ignoreCase = Option.Boolean('--ignore-case', true, {
    description: 'ignore case for -f,--files, default true',
  })
  globCwd = Option.String('--glob-cwd', {
    description: 'cwd used in glob',
  })

  // for safty
  yes = Option.Boolean('-y,--yes', false, {
    description: 'exec commands, default false(only preview commands, aka dry run)',
  })

  // for tokens
  showTokens = Option.Boolean('-t,--tokens,--show-tokens', false, {
    description: 'show available tokens',
  })

  output = Option.String('-o,--output', {
    description: 'output patterns',
  })

  codec = Option.String('--codec', 'webp', {
    description: 'use mozjpeg or webp',
  })

  metadata = Option.Boolean('--metadata', true, {
    description: 'keep metadata(only available with --codec webp)',
  })

  quality = Option.String('--quality', '80', {
    description: 'quality',
  })

  async execute(): Promise<number | void> {
    return this.run()
  }

  async run() {
    const { files, showTokens, ignoreCase, globCwd = process.cwd(), yes } = this
    const { output, codec, metadata, quality } = this
    // console.log(this)

    const resolvedFiles = globby.sync(files, { caseSensitiveMatch: !ignoreCase, cwd: globCwd })

    const targetExt = codec === 'mozjpeg' ? 'jpg' : 'webp'

    let outputs: string[] = []
    for (let item of resolvedFiles) {
      const tokens = getFilenameTokens(item)
      tokens.ext = targetExt

      // help decide -o
      if (showTokens) {
        console.log('') // split
        console.log('%s for %s', chalk.green('[tokens]'), chalk.yellow(item))
        printFilenameTokens(tokens)
      }

      // help confirm output
      let curOutput = ''
      if (output) {
        curOutput = renderFilenameTokens(output, tokens)
        outputs.push(curOutput)
        if (!yes) {
          console.log(
            '%s: %s -> %s',
            chalk.green('[compress]'),
            chalk.green(item),
            chalk.yellow(curOutput)
          )
        }
      }
    }

    if (!this.yes) {
      console.log('')
      console.log('-'.repeat(80))
      console.log(
        `  current ${chalk.yellow('previewing')} commands. After comfirmed, append ${chalk.green(
          '-y or --yes'
        )} flag to execute`
      )
      console.log('-'.repeat(80))
      console.log('')
      return
    }

    // start work
    await pmap(
      resolvedFiles,
      async (item, index) => {
        const curOutput = outputs[index]

        console.log(
          '%s: %s -> %s',
          chalk.green('[compress]'),
          chalk.green(item),
          chalk.yellow(curOutput)
        )

        return compress(item, curOutput, codec as Codec, metadata, Number(quality))
      },
      5
    )
  }
}

async function compress(
  input: string,
  output: string,
  codec: Codec,
  keepMetadata: boolean,
  quality: number
) {
  const outputPath = path.resolve(output)

  if (codec === 'mozjpeg') {
    const buf = await mozjpegCompress(input, {
      progressive: true,
      quality,
    })
    await fse.outputFile(outputPath, buf)
  } else {
    const buf = await sharpWebp(input, keepMetadata, {
      quality: quality,
    })
    await fse.outputFile(outputPath, buf)
  }

  const [originalSize, newSize] = await Promise.all(
    [input, outputPath].map((f) => fse.stat(f).then((stat) => stat.size))
  )

  console.log('[success] write to %s, %s -> %s', output, bytes(originalSize), bytes(newSize))
}
