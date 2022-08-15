import { createBitmap } from './bitmap.js'
import { rgbToCss } from './color.js'
import { backgroundRgb, minDim, maxDim, cellWidth, cellHeight, cellMargin, backgroundEndRgb } from './consts.js'
import { renderNoise } from './image.js'
import { loadImg } from './image.js'

export const createRenderer = onRender => {
  const start = async () => {
    const pixel = await loadImg('data/pixel-2.png')
  
    const noise = renderNoise( 512, 256 )

    const noiseEl = document.querySelector( '.noisy' )

    noiseEl.style.backgroundImage = `url(${ noise })`
  
    document.body.style.background = `linear-gradient(${rgbToCss(backgroundRgb)},${rgbToCss(backgroundEndRgb)})`
  
    const cont = document.querySelector('.cont')
  
    const bitmap = createBitmap(maxDim, minDim)
    
    const width = maxDim * cellWidth
    const height = minDim * cellHeight
  
    const canvasW = width + cellMargin
    const canvasH = height + cellMargin
  
    const canvas = document.createElement('canvas')
  
    canvas.width = canvasW
    canvas.height = canvasH
    canvas.classList.add('pixelated')
  
    const ctx = canvas.getContext('2d')
  
    const blitBmp = () => {
      canvas.width = canvasW
      canvas.height = canvasH
  
      for (let y = 0; y < minDim; y++) {
        const dy = y * cellHeight
  
        for (let x = 0; x < maxDim; x++) {
          const dx = x * cellWidth
  
          const index = y * maxDim + x
  
          if (bitmap.data[index]) ctx.drawImage(pixel, dx, dy)
        }
      }
    }
  
    cont.append(canvas)
  
    const tick = time => {
      onRender( bitmap, time )
      blitBmp()
  
      requestAnimationFrame(tick)
    }
  
    requestAnimationFrame(tick)
  }

  return { start }
}
