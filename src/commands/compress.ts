import { getFilenameTokens, printFilenameTokens, renderFilenameTokens } from '@magicdawn/x-args'
import bytes from 'bytes'
import chalk from 'chalk'
import { Command, Option, Usage } from 'clipanion'
import fse from 'fs-extra'
import globby from 'globby'
import path from 'path'
import pmap from 'promise.map'
import { mozjpegCompress } from '../compress'
import { sharpWebpCompress } from '../compress'

type Codec = 'mozjpeg' | 'webp'

export class CompressCommand extends Command {
  static paths = [['compress'], ['c']]

  static usage: Usage = {
    description: 'compress img',
  }

  /**
   * input glob
   */
  files = Option.String('-f,--files', {
    description: 'files as input',
  })
  ignoreCase = Option.Boolean('--ignore-case', true, {
    description: 'ignore case for -f,--files, default true',
  })
  globCwd = Option.String('--glob-cwd', {
    description: 'cwd used in glob',
  })

  /**
   * output options
   */
  // inspect tokens, for write output pattern
  showTokens = Option.Boolean('-t,--tokens,--show-tokens', false, {
    description: 'show available tokens',
  })

  output = Option.String('-o,--output', {
    description: 'output patterns',
  })

  codec = Option.String('--codec', 'mozjpeg', {
    description: 'Allowed codec: `mozjpeg` or `webp`',
  })

  metadata = Option.Boolean('--metadata', true, {
    description: 'keep metadata(only available with --codec webp)',
  })

  quality = Option.String('-q,--quality', '82', {
    description: 'quality',
  })

  /**
   * dir mode
   */

  dir = Option.String('-d,--dir', {
    description: 'compress whole dir, and output to dir_compressed',
  })

  dirSuffix = Option.String('--dir-suffix', '_compressed', {
    description: 'suffix to append to original dir name when using -d,--dir mode',
  })

  /**
   * safty
   */

  yes = Option.Boolean('-y,--yes', false, {
    description: 'exec commands, default false(only preview commands, aka dry run)',
  })

  async execute(): Promise<number | void> {
    return this.run()
  }

  async run() {
    const { files, showTokens, ignoreCase, globCwd = process.cwd(), yes, dir } = this
    const { output, codec, metadata, quality } = this
    // console.log(this)

    if (!this.files && !this.dir) {
      console.error('use -f,--files or -d,--dir to specify input imgs')
      return
    }

    const targetExt = codec === 'mozjpeg' ? 'jpg' : 'webp'

    const previewingTip = () => {
      console.log('')
      console.log('-'.repeat(80))
      console.log(
        `  current ${chalk.yellow('previewing')} commands. After comfirmed, append ${chalk.green(
          '-y or --yes'
        )} flag to execute`
      )
      console.log('-'.repeat(80))
      console.log('')
    }

    // reading this, so use arrow function
    const processFiles = async (files: string) => {
      const resolvedFiles = globby.sync(files, { caseSensitiveMatch: !ignoreCase, cwd: globCwd })
      console.log('')
      console.log(
        `${chalk.green('[globby]')}: docs ${chalk.blue(
          'https://github.com/mrmlnc/fast-glob#pattern-syntax'
        )}`
      )
      console.log(
        `${chalk.green('[globby]')}: mapping ${chalk.yellow(files)} to ${chalk.yellow(
          resolvedFiles.length
        )} files ->`
      )
      resolvedFiles.forEach((f) => {
        console.log(`  ${chalk.cyan(f)}`)
      })

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
              chalk.green('[compress:preview]'),
              chalk.green(item),
              chalk.yellow(curOutput)
            )
          }
        }
      }

      if (!this.yes) {
        previewingTip()
        return
      }

      // start work
      await pmap(
        resolvedFiles,
        async (item, index) => {
          const curOutput = outputs[index]

          console.log(
            '%s: %s -> %s',
            chalk.green('[compress:start]'),
            chalk.green(item),
            chalk.yellow(curOutput)
          )

          return compress(item, curOutput, codec as Codec, metadata, Number(quality))
        },
        5
      )
    }

    const processDir = async (dir: string) => {
      const dirResolved = path.resolve(dir)
      const dirtitle = path.basename(dirResolved)

      const pattern = './**/*.{jpg,jpeg,png,webp,bmp}'
      const resolvedFiles = globby.sync(pattern, {
        caseSensitiveMatch: !ignoreCase,
        cwd: dirResolved,
      })
      console.log(
        `${chalk.green('[globby]')}: mapping ${chalk.yellow(pattern)} in ${chalk.yellow(
          dirResolved
        )} to ${chalk.yellow(resolvedFiles.length)} files ->`
      )
      resolvedFiles.forEach((f) => {
        console.log(`  ${chalk.cyan(f)}`)
      })

      // append _compressed
      const outputDirResolved = dirResolved + this.dirSuffix
      const outputDirTitle = dirtitle + this.dirSuffix

      const outputs: string[] = []
      const outputsRelative: string[] = []

      for (let item of resolvedFiles) {
        const outputRelativeFilename = `${path.basename(item, path.extname(item))}.${targetExt}`
        outputs.push(`${outputDirResolved}/${outputRelativeFilename}`)
        outputsRelative.push(outputRelativeFilename)

        if (!yes) {
          console.log(
            '%s: %s -> %s',
            chalk.green('[compress:preview]'),
            chalk.green(dirtitle + '/' + item),
            chalk.yellow(outputDirTitle + '/' + outputRelativeFilename)
          )
        }
      }

      if (!this.yes) {
        previewingTip()
        return
      }

      // start work
      await pmap(
        resolvedFiles,
        async (item, index) => {
          const curOutput = outputs[index]

          console.log(
            '%s: %s -> %s',
            chalk.green('[compress:start]'),
            chalk.green(dirtitle + '/' + item),
            chalk.yellow(outputDirTitle + '/' + outputsRelative[index])
          )

          return compress(
            path.join(dirResolved, item),
            curOutput,
            codec as Codec,
            metadata,
            Number(quality)
          )
        },
        5
      )
    }

    const inputMode = this.files ? 'files' : 'dir'
    if (inputMode === 'files') {
      await processFiles(files!)
    } else if (inputMode === 'dir') {
      await processDir(dir!)
    }
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
    const buf = await sharpWebpCompress(input, keepMetadata, {
      quality: quality,
    })
    await fse.outputFile(outputPath, buf)
  }

  const [originalSize, newSize] = await Promise.all(
    [input, outputPath].map((f) => fse.stat(f).then((stat) => stat.size))
  )

  console.log(
    '%s write to %s, %s -> %s',
    chalk.green('[compress:success]'),
    output,
    bytes(originalSize),
    bytes(newSize)
  )
}
