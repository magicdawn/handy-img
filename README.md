<!-- AUTO_GENERATED_UNTOUCHED_FLAG -->

# handy-img

> handy img tool and API

[![Build Status](https://img.shields.io/travis/magicdawn/handy-img.svg?style=flat-square)](https://travis-ci.org/magicdawn/handy-img)
[![Coverage Status](https://img.shields.io/codecov/c/github/magicdawn/handy-img.svg?style=flat-square)](https://codecov.io/gh/magicdawn/handy-img)
[![npm version](https://img.shields.io/npm/v/handy-img.svg?style=flat-square)](https://www.npmjs.com/package/handy-img)
[![npm downloads](https://img.shields.io/npm/dm/handy-img.svg?style=flat-square)](https://www.npmjs.com/package/handy-img)
[![npm license](https://img.shields.io/npm/l/handy-img.svg?style=flat-square)](http://magicdawn.mit-license.org)

## Install

```sh
$ npm i -S handy-img
```

# cli

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

## API

```js
const himg = require('handy-img')
```

### `metadata(input)` -> `Promise<Object>`

- use `sharp` extract img metadata
- `input` can be `String filepath` or `Buffer buf`

### `decode(input)` -> `Promise<ImageDataLike>`

- use `sharp` decode img
- `input` can be `String filepath` or `Buffer buf`
- `ImageDataLike` has signature

```ts
type ImageDataLike = {
  data: Uint8Array
  width: number
  height: number
}
```

### `mozjpegEncode`

```ts
function mozjpegEncode(
  data: Uint8Array,
  width: number,
  height: number,
  options: Object
): Promise<Buffer>
```

encode the ImageData to compressed jpeg buffer

### `mozjpegCompress`

```ts
type Input = string | Buffer
function mozjpegCompress(input: Input, options: Object): Promise<Buffer>
```

use mozjpeg to compress file

## Changelog

[CHANGELOG.md](CHANGELOG.md)

## License

the MIT License http://magicdawn.mit-license.org
