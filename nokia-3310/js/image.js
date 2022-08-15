export const loadImg = src => new Promise(
  resolve => {
    const img = new Image()

    img.onload = () => resolve(img)

    img.src = src
  }
)

export const renderNoise = ( width, height, opacity = 15 ) => {
  const canvas = document.createElement( 'canvas' )
  
  canvas.width = width
  canvas.height = height
  
  const ctx = canvas.getContext('2d')

  const imageData = ctx.createImageData( width, height )

  for( let y = 0; y < height; y++ ){
    for( let x = 0; x < width; x++ ){
      const index = y * width + x
      const dataIndex = index * 4

      const v = Math.floor( Math.random() * 256 )

      imageData.data[ dataIndex ] = v
      imageData.data[ dataIndex + 1 ] = v
      imageData.data[ dataIndex + 2 ] = v
      imageData.data[ dataIndex + 3 ] = opacity
    }
  }

  ctx.putImageData( imageData, 0, 0 )

  return canvas.toDataURL( 'image/png' )
}
