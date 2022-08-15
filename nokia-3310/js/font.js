import { blitBitmap } from './bitmap.js'
import { createBitmap } from './bitmap.js'
import { loadImg } from './image.js'

export const loadFont = async src => {
  const font = await loadImg(src)
  const fontCanvas = document.createElement('canvas')

  fontCanvas.width = font.width
  fontCanvas.height = font.height

  const fontCtx = fontCanvas.getContext('2d')

  fontCtx.drawImage(font, 0, 0)

  const fontData = fontCtx.getImageData(0, 0, font.width, font.height)

  const bitmaps = splitFont(fontData)

  return bitmaps
}

const splitFont = imageData => {
  const bottom = imageData.height - 1
  const height = imageData.height - 3
  const bitmaps = []
  const pos = []

  let inChar = false
  let current = {}

  for (let dx = 0; dx < imageData.width; dx++) {
    const index = bottom * imageData.width + dx
    const isChar = imageData.data[index * 4] === 0

    if (isChar && !inChar) {
      inChar = true
      current.x = dx
    }

    if (!isChar && inChar) {
      current.width = dx - current.x
      pos.push(current)
      current = {}
      inChar = false
    }
  }

  for (const { x, width } of pos) {
    const bitmap = createBitmap(width, height)

    for (let y = 0; y < height; y++) {
      const sy = y + 1

      for (let dx = 0; dx < width; dx++) {
        const bitmapIndex = y * width + dx
        const dataIndex = sy * imageData.width + x + dx
        const isOn = imageData.data[dataIndex * 4] === 0

        bitmap.data[bitmapIndex] = isOn ? 1 : 0
      }
    }

    bitmaps.push(bitmap)
  }

  return bitmaps
}

export const textDrawList = (font, text = '') => {
  const chars = text.split('')

  let bottom = 0
  let y = 0
  let x = 0

  const drawList = []

  for (const ch of chars) {
    const code = ch.charCodeAt(0)

    if (code < 33 || code > 126) {
      x += 2
      continue
    }

    const index = code - 33

    const bitmap = font[index]
    
    if( bitmap.height > bottom ) bottom = bitmap.height

    drawList.push({ x, y, bitmap })

    x += bitmap.width + 1
  }

  return { right: x, bottom, drawList }
}