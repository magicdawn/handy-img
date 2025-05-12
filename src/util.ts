import sharp from 'sharp'

async function getImgAutoOrient(filePath: string) {
  // Get dimensions taking EXIF Orientation into account.
  const { autoOrient } = await sharp(filePath).metadata()
  return autoOrient
}

export async function isVerticalImg(filePath: string) {
  const { width, height } = await getImgAutoOrient(filePath)
  return width < height
}

export async function isHorizontalImg(filePath: string) {
  const { width, height } = await getImgAutoOrient(filePath)
  return width > height
}
