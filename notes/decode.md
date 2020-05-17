# img decode

## node & electron-main

使用 sharp decode

## web & electron-renderer

- 使用 `createBitmap` / `img` element decode, 但此时不能拿出来
- 使用 canvas 画上去, 后使用 canvas.getImageData 获取 imagedata

参考 Squoosh.app 代码

```js
export async function nativeDecode(blob) {
  /* eslint no-restricted-globals: off */
  // Prefer createImageBitmap as it's the off-thread option for Firefox.
  const drawable =
    'createImageBitmap' in self ? await createImageBitmap(blob) : await blobToImg(blob)

  return drawableToImageData(drawable)
}

export async function blobToImg(blob) {
  const url = URL.createObjectURL(blob)
  try {
    return await decodeImage(url)
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function decodeImage(url) {
  const img = new Image()
  img.decoding = 'async'
  img.src = url
  const loaded = new Promise((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(Error('Image loading error'))
  })

  if (img.decode) {
    // Nice off-thread way supported in Safari/Chrome.
    // Safari throws on decode if the source is SVG.
    // https://bugs.webkit.org/show_bug.cgi?id=188347
    await img.decode().catch(() => null)
  }

  // Always await loaded, as we may have bailed due to the Safari bug above.
  await loaded
  return img
}

// drawable: ImageBitmap | HTMLImageElement,
// opts: DrawableToImageDataOptions = {}
export function drawableToImageData(drawable, opts = {}) {
  const {
    width = drawable.width,
    height = drawable.height,
    sx = 0,
    sy = 0,
    sw = drawable.width,
    sh = drawable.height,
  } = opts

  // Make canvas same size as image
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  // Draw image onto canvas
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not create canvas context')
  ctx.drawImage(drawable, sx, sy, sw, sh, 0, 0, width, height)
  return ctx.getImageData(0, 0, width, height)
}
```
