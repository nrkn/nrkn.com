export const createBitmap = (width, height, data) => {
  width |= 0
  height |= 0

  if (width < 1) throw Error('Expected positive width')
  if (height < 1) throw Error('Expected positive height')

  const size = width * height

  data = data ?? Array(size).fill(0)

  if (!Array.isArray(data)) throw Error('Expected array for data')
  if (data.length !== size) throw Error(`Expected ${size} bits, saw ${data.length}`)
  if (!data.every(v => v === 0 || v === 1)) throw Error('Expected bit array for data')

  const bitmap = { width, height, data }

  return bitmap
}

export const blitBitmap = (
  source, dest,
  sx = 0, sy = 0,
  sw = source.width - sx, sh = source.height - sy,
  dx = 0, dy = 0
) => {
  sx = sx | 0
  sy = sy | 0
  sw = sw | 0
  sh = sh | 0
  dx = dx | 0
  dy = dy | 0

  if (sw <= 0 || sh <= 0) return

  for (let y = 0; y < sh; y++) {
    const sourceY = sy + y

    if (sourceY < 0 || sourceY >= source.height) continue

    const destY = dy + y

    if (destY < 0 || destY >= dest.height) continue

    for (let x = 0; x < sw; x++) {
      const sourceX = sx + x

      if (sourceX < 0 || sourceX >= source.width) continue

      const destX = dx + x

      if (destX < 0 || destX >= dest.width) continue

      const sourceIndex = sourceY * source.width + sourceX
      const destIndex = destY * dest.width + destX

      dest.data[destIndex] = source.data[sourceIndex]
    }
  }
}
