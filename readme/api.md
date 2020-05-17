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
