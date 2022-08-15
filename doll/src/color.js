export const rgbToHsl = (r, g, b) => {
  r /= 255, g /= 255, b /= 255

  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max == min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }

    h /= 6
  }

  return [ Math.floor( h * 360 ), Math.floor( s * 100 ), Math.floor( l * 100 ) ]
}

const getRgba = img => {
  const { width, height } = img
  const canvas = document.createElement('canvas')

  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')

  context.drawImage(img, 0, 0)

  const imageData = context.getImageData(0, 0, width, height)

  const colors = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x
      const dataIndex = index * 4

      const rgba = imageData.data.slice(dataIndex, dataIndex + 4)

      colors.push(rgba)
    }
  }

  return colors
}

export const getHsl = img => {
  const rgba = getRgba( img )

  return rgba.map( ([ r, g, b ]) => rgbToHsl( r, g, b ) )
}