<!-- AUTO_GENERATED_UNTOUCHED_FLAG -->

# handy-img

> handy img tool and API

[![Build Status](https://img.shields.io/travis/magicdawn/handy-img.svg?style=flat-square)](https://travis-ci.org/magicdawn/handy-img)
[![Coverage Status](https://img.shields.io/codecov/c/github/magicdawn/handy-img.svg?style=flat-square)](https://codecov.io/gh/magicdawn/handy-img)
[![npm version](https://img.shields.io/npm/v/handy-img.svg?style=flat-square)](https://www.npmjs.com/package/handy-img)
[![npm downloads](https://img.shields.io/npm/dm/handy-img.svg?style=flat-square)](https://www.npmjs.com/package/handy-img)
[![npm license](https://img.shields.io/npm/l/handy-img.svg?style=flat-square)](http://magicdawn.mit-license.org)

## compress Features

- [x] target mozjpeg / webp are supported. same as `@squoosh/cli`
- [x] Node.js native addon, better performance than squoosh WASM version.
- [x] batch process, support `--files` glob or dir mode `--dir`
- [x] parallel compress. default concurrency `cpu-core-count - 2`

## Install

```sh
pnpm add -g handy-img
```

## or invoke without install

```
# pnpm, recommend
pnpm dlx handy-img

# or npx
npx handy-img

# or pnpx
pnpx handy-img

# or yarn 2
yarn dlx handy-img
```

## cli

just type `himg` or `handy-img`

```txt
$ himg
himg <命令>

命令：
  himg compress <file>  compress file                               [aliases: c]
  himg info <file>      show info for file                          [aliases: i]

选项：
  --version  显示版本号                                                   [布尔]
  --help     显示帮助信息                                                 [布尔]

缺少 non-option 参数：传入了 0 个, 至少需要 1 个
```

### `himg compress` or `himg c`

```
$ himg c -h
Compress img

$ handy-img compress

━━━ Options ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  -f,--files #0                files as input
  --ignore-case                ignore case for -f,--files, default true
  --glob-cwd #0                cwd used in glob
  -t,--tokens,--show-tokens    show available tokens
  -o,--output #0               output patterns
  --codec #0                   Allowed codec: `mozjpeg` or `webp`
  --metadata                   keep metadata(only available with --codec webp)
  -q,--quality #0              quality
  -d,--dir #0                  compress whole dir, and output to dir_compressed
  --dir-suffix #0              suffix to append to original dir name when using -d,--dir mode
  -y,--yes                     exec commands, default false(only preview commands, aka dry run)
```

#### flags

| flag                        | desc                                                             | default       | remark                                               |
| --------------------------- | ---------------------------------------------------------------- | ------------- | ---------------------------------------------------- |
| `-f,--files`                | specify input,                                                   |               | glob supported, see globby & fast-glob               |
| `--ignore-case`             | ignore case when glob input                                      | `true`        |                                                      |
| `--glob-cwd`                | cwd of `-f,--files` provided                                     | `pwd`         |                                                      |
| `-t,--tokens,--show-tokens` | show available tokens                                            |               | help you to decide the `-o,--output` flag, see below |
| `-o,--output`               | output pattern                                                   |               |                                                      |
| `--codec`                   | Allowed codec: `mozjpeg` or `webp`                               | `mozjpeg`     |                                                      |
| `--metadata`                | keep metadata(only available with --codec webp)                  | `true`        | keep exif                                            |
| `-q,--quality`              | quality                                                          | `82`          | encode quality, `0-100`                              |
| `-d,--dir`                  | compress whole dir, and output to dir_compressed                 |               |                                                      |
| `--dir-suffix`              | suffix to append to original dir name when using -d,--dir mode   | `_compressed` |                                                      |
| `-y,--yes`                  | exec commands, default false(only preview commands, aka dry run) | `false`       |                                                      |

## usage

### 0.TLDR

just use dir mode, it's simple

```sh
himg c -d '/some/dir/here' -y
```

### 1.decide input

![image](https://user-images.githubusercontent.com/4067115/180050266-1e3a1f46-0e8d-486a-8ea2-8c2dac604a9f.png)

### 2.then use `-t,--tokens,--show-tokens` show available tokens

![image](https://user-images.githubusercontent.com/4067115/180050603-bb4ea54d-cad6-4c91-b86d-0f6d48cde788.png)

### 3.write your output pattern & preview

example pattern `himg c -f './*.jpg' -t -o ':dir/:name_compressed.:ext'`
![image](https://user-images.githubusercontent.com/4067115/180050746-084418e3-1ac4-43d9-9e7e-5fe07728a60c.png)

example pattern `himg c -f './*.jpg' -t -o ':dir/compressed/:name.:ext'`
![image](https://user-images.githubusercontent.com/4067115/180050958-59196349-3693-4fef-9f92-c9520babccf3.png)

### 4.use `-y,--yes` to execute

without this option, you will see what input will be processed and what file will be generated.
but the compress action will not really execute

```
--------------------------------------------------------------------------------
  current previewing commands. After comfirmed, append -y or --yes flag to execute
--------------------------------------------------------------------------------
```

it's like a safety guard for a gun

### use dir mode

```
himg c -d ./unsplash-壁纸 --dir-suffix mini -y
```

glob all imgs in the dir you provided, and output to a new directory, which name is original name + dir suffix
and img will keep same structure.

![image](https://user-images.githubusercontent.com/4067115/180051281-7721464c-dde1-4690-a241-fe525d1e676f.png)

![image](https://user-images.githubusercontent.com/4067115/180051359-ed180f35-a57d-478e-b122-eb77532f342a.png)

## Changelog

[CHANGELOG.md](CHANGELOG.md)

## License

the MIT License http://magicdawn.mit-license.org
