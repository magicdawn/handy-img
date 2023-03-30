import { finderSort } from '@magicdawn/finder-sort'
import { getFilenameTokens, printFilenameTokens, renderFilenameTokens } from '@magicdawn/x-args'
import bytes from 'bytes'
import chalk from 'chalk'
import { Command, Option, Usage } from 'clipanion'
import figures from 'figures'
import fse from 'fs-extra'
import globby from 'globby'
import LogSymbols from 'log-symbols'
import { PathFinder } from 'mac-helper'
import { performance } from 'node:perf_hooks'
import { cpus } from 'os'
import path from 'path'
import pmap from 'promise.map'
import { decode, metadata } from '../codec/decode'
import { mozjpegCompress, sharpMozjpegCompress, sharpWebpCompress } from '../compress'

// locale: en-US / zh-CN / zh-TW
// lang: en / zh_CN / zh_TW
import { humanizer } from 'humanize-duration'
import { sync as osLocaleSync } from 'os-locale'
const locale = osLocaleSync()
const lang = locale.startsWith('zh') ? locale.replace(/-/, '_') : locale.split('-')[0]
const getDurationDisplay = humanizer({ language: lang, fallbacks: ['en'], round: true })

// 2023-03-24:
// sharp 在 2021 内置了 mozjepg codec
// 测试下来, 同 quality, 比 mozjpeg 更快, size 更小, 还能 keep metadata
// mozjpeg 改成 mozjpeg-raw
// mozjpeg 转成 sharp 内置的 mozjepg
const AllOWED_CODEC = ['mozjpeg', 'webp', 'mozjpeg-raw'] as const
type Codec = typeof AllOWED_CODEC extends ReadonlyArray<infer T> ? T : never

const DEFAULT_CONCURRENCY = process.env.UV_THREADPOOL_SIZE
  ? Number(process.env.UV_THREADPOOL_SIZE)
  : Math.round(cpus().length * 1.5) // 受限于 UV_THREADPOOL_SIZE, 再大到 libuv 那里都得排队

// general purpose
const DEFAULT_QUALITY = 80

const DIR_IMG_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'bmp']
const DIR_IMG_PATTERN = `./**/*.{${DIR_IMG_EXTS.join(',')}}`

export class CompressCommand extends Command {
  static paths = [['compress'], ['c']]

  static usage: Usage = {
    description: 'compress img',
    details: `
		codec detail \n
			- mozjpeg: use sharp jpeg({ mozjepg: true }), aka sharp's built in mozjpeg
			- webp: use sharp webp
			- mozjepg-raw: use magicdawn/node-mozjepg
    `,
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

  codec = Option.String('-C,--codec', 'mozjpeg' satisfies Codec, {
    description: `Allowed codec: ${AllOWED_CODEC.map((c) => `\`${c}\``).join(' or ')}`,
  })

  metadata = Option.Boolean('--metadata', true, {
    description: 'keep metadata(not available with --codec mozjpeg)',
  })

  quality = Option.String('-q,--quality', DEFAULT_QUALITY.toString(), {
    description: `quality, default \`${DEFAULT_QUALITY}\``,
  })

  concurrency = Option.String('-c,--concurrency', DEFAULT_CONCURRENCY.toString(), {
    description: `parallel limit, current default \`${DEFAULT_CONCURRENCY}\`, influenced by UV_THREADPOOL_SIZE and cpu-core-count`,
  })

  /**
   * dir mode
   */

  dir = Option.String('-d,--dir', {
    description: 'dir mode: compress whole dir, and output to dir_compressed',
  })

  dirSuffix = Option.String('--dir-suffix', '', {
    description: `dir mode output dir: <original-dir>+\`suffix\`, default \`_compressed\``,
  })

  dirIgnore = Option.String('-I,--dir-ignore', '', {
    description: 'ignore pattern in dir for skip compress, use space to split patterns',
  })

  handleOtherFiles = Option.String('-O,--other,--others,--other-files', '', {
    description: 'copy/move none image files when using dir mode',
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

  get valitedArgs() {
    let { codec, quality, concurrency } = this

    if (!AllOWED_CODEC.includes(codec as Codec)) {
      throw new Error('unsupported codec, supported: ' + AllOWED_CODEC.join(' or '))
    }

    let qualityAsNum = Number(quality)
    let concurrencyAsNum = Number(concurrency)
    if (isNaN(qualityAsNum)) throw new Error('expect quality as a number')
    if (isNaN(concurrencyAsNum)) throw new Error('expect concurrency as a number')

    return {
      codec: codec as Codec,
      quality: qualityAsNum,
      concurrency: concurrencyAsNum,
    }
  }

  get mappedArgs() {
    const { codec, quality } = this.valitedArgs
    const dirSuffix = this.dirSuffix || `_${codec}_q${quality}_compressed`

    return { dirSuffix }
  }

  async run() {
    const {
      files,
      showTokens,
      ignoreCase,
      globCwd = process.cwd(),
      yes,
      dir,
      output,
      metadata,
      dirIgnore,
    } = this
    const { codec, quality, concurrency } = this.valitedArgs
    const { dirSuffix } = this.mappedArgs

    if (!this.files && !this.dir) {
      console.error('use -f,--files or -d,--dir to specify input imgs')
      return
    }

    const targetExt = codec === 'webp' ? 'webp' : 'jpg'

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
      let resolvedFiles: string[] = []

      if (files === '$PF') {
        resolvedFiles = await PathFinder.allSelected()
        resolvedFiles = resolvedFiles.filter((item) => {
          const basename = path.basename(item)
          const ext = path.extname(item).slice(1).toLowerCase()
          let stat: fse.Stats | undefined
          return (
            !basename.startsWith('.') &&
            DIR_IMG_EXTS.includes(ext) &&
            (stat = fse.statSync(item)) &&
            stat.isFile()
          )
        })
        if (!resolvedFiles.length) {
          console.error('$PF has no valid imgs')
          process.exit(1)
        }
      } else {
        resolvedFiles = globby.sync(files, { caseSensitiveMatch: !ignoreCase, cwd: globCwd })
      }

      resolvedFiles = finderSort(resolvedFiles, { folderFirst: true })
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
        if (showTokens || !output) {
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
      if (this.yes && this.output) {
        await pmap(
          resolvedFiles,
          async (item, index) => {
            const curOutput = outputs[index]

            const progress = `${(index + 1)
              .toString()
              .padStart(resolvedFiles.length.toString().length, '0')}/${resolvedFiles.length}`

            // item, curOutput,
            return compress({
              inputDisplay: item,
              inputFullpath: path.resolve(item),
              outputDisplay: curOutput,
              outputFullpath: path.resolve(curOutput),
              progress,
              codec,
              metadata,
              quality,
            })
          },
          concurrency
        )
      }
    }

    const processDir = async (dir: string) => {
      const dirResolved = path.resolve(dir)
      const dirtitle = path.basename(dirResolved)

      let resolvedFiles = globby.sync([DIR_IMG_PATTERN], {
        dot: false,
        caseSensitiveMatch: !ignoreCase,
        cwd: dirResolved,
        ignore: [
          // don't process these files
          '**/*_{mozjpeg,webp}_q[0-9][0-9]_compressed/*', // compressed dir
          ...(this.dirIgnore || '')
            .split(' ')
            .map((p) => p.trim())
            .filter(Boolean),
        ],
      })
      resolvedFiles = finderSort(resolvedFiles, { folderFirst: true })

      console.log(
        `${chalk.green('[globby]')}: mapping ${chalk.yellow(DIR_IMG_PATTERN)} in ${chalk.yellow(
          dirResolved
        )} to ${chalk.yellow(resolvedFiles.length)} files :`
      )
      resolvedFiles.forEach((f) => {
        console.log(`  ${chalk.cyan(f)}`)
      })

      // append _compressed
      const outputDirResolved = dirResolved + dirSuffix
      const outputDirTitle = dirtitle + dirSuffix

      const outputs: string[] = []
      const outputsRelative: string[] = []

      for (let item of resolvedFiles) {
        // item -> 切换 ext
        const outputRelativeFilename = path.join(
          path.dirname(item),
          `${path.basename(item, path.extname(item))}.${targetExt}`
        )
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

      // start work
      if (this.yes) {
        await pmap(
          resolvedFiles,
          async (item, index) => {
            const inputDisplay = dirtitle + '/' + item
            const inputFullpath = path.join(dirResolved, item)
            const outputDisplay = outputDirTitle + '/' + outputsRelative[index]
            const outputFullpath = outputs[index]
            const progress = `${(index + 1)
              .toString()
              .padStart(resolvedFiles.length.toString().length, '0')}/${resolvedFiles.length}`
            return compress({
              inputDisplay,
              inputFullpath,
              outputDisplay,
              outputFullpath,
              progress,
              codec,
              metadata,
              quality,
            })
          },
          concurrency
        )
      }

      // other files
      const processOtherFiles = async () => {
        if (!this.handleOtherFiles) return

        if (!['move', 'copy'].includes(this.handleOtherFiles)) {
          console.error('expect move/copy for --other-files')
          return
        }

        let otherFiles = globby.sync(
          [
            // all files
            './**/*',
            // '!./**/*.{jpg,jpeg,png,webp,bmp}',
            // ignore macOS resource fork file
            '!**/.DS_Store',
            '!**/._*',
          ],
          {
            caseSensitiveMatch: !ignoreCase,
            cwd: dirResolved,
            dot: true, // 匹配 .file
          }
        )
        // 去除已经处理的 img 文件
        otherFiles = otherFiles.filter((item) => {
          return !resolvedFiles.includes(item)
        })
        otherFiles = finderSort(otherFiles, { folderFirst: true })

        console.log('')
        console.log(`${chalk.green('[other-files]')}: %s`, this.handleOtherFiles)
        console.log(
          `${chalk.green('[globby]')}: found ${chalk.yellow(
            otherFiles.length
          )} none image files in ${chalk.yellow(dirResolved)} :`
        )
        otherFiles.forEach((f) => {
          console.log(`  ${chalk.cyan(f)}`)
        })
        console.log('')

        if (!this.yes) {
          otherFiles.forEach((file) => {
            console.log(
              '%s: %s %s -> %s',
              chalk.green('[compress:preview]'),
              this.handleOtherFiles,
              chalk.green(dirtitle + '/' + file),
              chalk.yellow(outputDirTitle + '/' + file)
            )
          })
        }

        if (this.yes) {
          await pmap(
            otherFiles,
            async (file) => {
              const src = path.join(dirResolved, file)
              const dest = path.join(outputDirResolved, file)

              await fse.ensureDir(path.dirname(dest))

              console.log(
                '%s: %s %s -> %s',
                chalk.green(`[compress:${this.handleOtherFiles}-other-files]`),
                this.handleOtherFiles,
                chalk.green(dirtitle + '/' + file),
                chalk.yellow(outputDirTitle + '/' + file)
              )

              if (this.handleOtherFiles === 'move') {
                await fse.move(src, dest)
              } else if (this.handleOtherFiles === 'copy') {
                await fse.copyFile(src, dest)
              }
            },
            5
          )
        }
      }
      await processOtherFiles()

      if (!this.yes) {
        previewingTip()
        return
      }
    }

    const start = performance.now()
    const inputMode = this.files ? 'files' : 'dir'

    if (inputMode === 'files') {
      await processFiles(files!)
    } else if (inputMode === 'dir') {
      if (dir === '$PF') {
        const pfSelectedDirs = await PathFinder.allSelected()
        if (!pfSelectedDirs.length) {
          console.error('$PF has no select')
          process.exit(1)
        }

        console.log('$PF maps to :')
        pfSelectedDirs.forEach((dir) => {
          console.log(` ${chalk.cyan(dir)}`)
        })

        for (const currentDir of pfSelectedDirs) {
          await processDir(currentDir)
        }
      } else {
        await processDir(this.dir!)
      }
    }

    if (this.yes) {
      const costMs = performance.now() - start
      const cost = getDurationDisplay(costMs)
      console.log('%s %s cost %s', LogSymbols.success, chalk.green('[compress:done]'), cost)
    }
  }
}

async function compress({
  inputDisplay,
  inputFullpath,
  outputDisplay,
  outputFullpath,
  progress,
  codec,
  metadata,
  quality,
  force = false,
}: {
  inputDisplay: string
  inputFullpath: string
  outputDisplay: string
  outputFullpath: string
  progress: string
  codec: Codec
  metadata: boolean
  quality: number
  force?: boolean
}) {
  // skip
  // start
  // done
  // error
  const len = 5

  // 文件名引号
  inputDisplay = chalk.yellow(`'${inputDisplay}'`)
  outputDisplay = chalk.cyan(`'${outputDisplay}'`)

  // validate existing compressed file
  if (!force && (await outputValid(inputFullpath, outputFullpath))) {
    console.log(
      '%s %s (%s) %s -> %s',
      LogSymbols.success,
      chalk.green('[compress:skip]') + ' ',
      progress,
      inputDisplay,
      outputDisplay
    )
    return
  }

  let buf: Buffer | undefined
  try {
    if (codec === 'mozjpeg') {
      buf = await sharpMozjpegCompress(inputFullpath, metadata, {
        progressive: true,
        quality,
      })
    }
    if (codec === 'webp') {
      buf = await sharpWebpCompress(inputFullpath, metadata, {
        quality,
      })
    }
    if (codec === 'mozjpeg-raw') {
      buf = await mozjpegCompress(inputFullpath, {
        progressive: true,
        quality,
      })
    }
  } catch (err) {
    console.error(
      `%s %s (%s) failed to compress %s -> %s\n  error: \n`,
      LogSymbols.error,
      chalk.bgRed('[compress:error]'),
      progress,
      inputDisplay,
      outputDisplay,
      // line 2
      err,
      '\n'
    )
    return
  }

  if (!buf) return

  const originalSize = await fse.stat(inputFullpath).then((stat) => stat.size)
  const newSize = buf.length
  const rate = newSize / originalSize
  const changedRate = rate - 1

  // 离谱, 压缩结果比原始还大
  // or 压缩结果不理想, reduce size 不到 5%
  // TODO: make 0.95 configurable
  const useOriginal = rate >= 1 || rate > 0.95

  const content =
    changedRate > 0
      ? `${figures.arrowUp} ${Math.round(changedRate * 100)}%`
      : `${figures.arrowDown} ${Math.round(-changedRate * 100)}%`
  const changedRateDisplay = useOriginal ? chalk.bgYellow(content) : chalk.bgGreen(content)

  if (useOriginal) {
    await fse.ensureDir(path.dirname(outputFullpath)) // 需要 ensureDir
    await fse.copyFile(inputFullpath, outputFullpath)
    console.log(
      '%s %s (%s) discard compress result & copy to %s, for %s -> %s %s',
      LogSymbols.warning,
      chalk.bgYellow('[compress:copy]'),
      progress,
      outputDisplay,
      bytes(originalSize),
      bytes(newSize),
      changedRateDisplay
    )
  }

  // 正常情况
  else {
    await fse.outputFile(outputFullpath, buf)
    console.log(
      '%s %s (%s) write to %s, %s -> %s %s',
      LogSymbols.success,
      chalk.green('[compress:done]'),
      progress,
      outputDisplay,
      bytes(originalSize),
      bytes(newSize),
      changedRateDisplay
    )
  }
}

async function outputValid(inputFullpath: string, outputFullpath: string): Promise<boolean> {
  if (!(await fse.exists(outputFullpath))) return false

  const stat = await fse.stat(outputFullpath)
  if (!(stat && stat.size > 0)) return false

  const inputMeta = await metadata(inputFullpath)
  try {
    // width & height match
    const outputMeta = await metadata(outputFullpath)
    if (inputMeta.width !== outputMeta.width || inputMeta.height !== outputMeta.height) {
      return false
    }

    // try decode
    await decode(outputFullpath)
  } catch (e) {
    return false
  }

  // all pass, valid
  return true
}
