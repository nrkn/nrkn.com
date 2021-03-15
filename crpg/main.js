'use strict'

// draw a 9x9 map with grass placed randomly, some trees
// draw player
// player animates
// player can move around with arrows or tap, trees and edge of map block
// scaled as big as possible given screen size up to max 400%, centered in viewport

const s = () => {

const canvas = document.querySelector( 'canvas' )
const ctx = canvas.getContext( '2d' )

const loadImage = path => new Promise( resolve => {
  const img = new Image()
  img.onload = () => resolve( img )
  img.src = path
})

const loadImages = paths => Promise.all( paths.map( loadImage ) )

const tileSize = 16
const viewSize = 9
const canvasSize = viewSize + 1
const playerAnimationTime = 500
const center = Math.floor( viewSize / 2 )
const mapSize = 50

let facing = 0
let pX = 25
let pY = 25

loadImages( [ 'player.gif', 'tiles.gif', 'font.gif' ] ).then( ( [ player, tiles, font ] ) => {
  const tileCount = tiles.width / tileSize

  const move = ( x, y ) => {
    x = pX + x
    y = pY + y

    const i = ( y * mapSize ) + x
    const tileIndex = map[ i ]

    if( x < 0 || y < 0 || x >= mapSize || y >= mapSize || tileIndex === tileCount - 1 ) return

    pX = x
    pY = y
  }

  document.onkeypress = e => {
    let x = 0
    let y = 0

    if( e.key === 'ArrowLeft' ){
      facing = 1
      x = -1
    }
    if( e.key === 'ArrowRight' ){
      facing = 0
      x = 1
    }
    if( e.key === 'ArrowUp' ){
      y = -1
    }
    if( e.key === 'ArrowDown' ){
      y = 1
    }

    move( x, y )
  }

  canvas.onclick = e => {
    const rect = canvas.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const dX = width / canvasSize
    const dY = height / canvasSize
    const tX = Math.floor( e.offsetX / dX ) - 1
    const tY = Math.floor( e.offsetY / dY ) - 1

    let x = 0
    let y = 0

    if( tY === center ){
      x = tX < center ? -1 : tX > center ? 1 : 0
    } else if( tX === center ){
      y = tY < center ? -1 : tY > center ? 1 : 0
    }

    facing = x === -1 ? 1 : x === 1 ? 0 : facing

    move( x, y )
  }

  const drawText = ( str = '', x = 0, y = 0 ) => {
    for( let i = 0; i < str.length; i++ ){
      const c = str.charCodeAt( i ) - 32
      const sx = c * 8
      const sy = 0
      const sWidth = 8
      const sHeight = 8
      const dx = x * 8
      const dy = y * 8
      const dWidth = 8
      const dHeight = 8

      ctx.drawImage( font, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )

      x++
    }
  }

  const generateMap = () => {
    const tiles = []

    for( let y = 0; y < mapSize; y++ ){
      for( let x = 0; x < mapSize; x++ ){
        const tileIndex = x === center && y === center ? 0 : Math.floor( Math.random() * tileCount )

        tiles.push( tileIndex )
      }
    }

    return tiles
  }

  const map = generateMap()

  let start
  let elapsed

  const draw = time => {
    if( time && !start ) start = time

    elapsed = time - start

    const playerTime = Math.floor( elapsed / playerAnimationTime )
    const playerFrame = playerTime % 2 ? 0 : 1

    canvas.width = canvas.height = tileSize * canvasSize

    for( let y = 0; y < viewSize; y++ ){
      for( let x = 0; x < viewSize; x++ ){
        const mapX = ( pX - center ) + x
        const mapY = ( pY - center ) + y

        if( mapX < 0 || mapY < 0 || mapX >= mapSize || mapY >= mapSize ) continue

        const i = ( mapY * mapSize ) + mapX
        const tileIndex = map[ i ]

        const sx = tileIndex * tileSize
        const sy = 0
        const sWidth = tileSize
        const sHeight = tileSize
        const dx = ( x + 1 ) * tileSize
        const dy = ( y + 1 ) * tileSize
        const dWidth = tileSize
        const dHeight = tileSize

        ctx.drawImage( tiles, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )

        if( x === center && y === center ){
          const sx = ( playerFrame * tileSize ) + ( facing * tileSize * 2 )

          ctx.drawImage( player, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight )
        }
      }
    }

    drawText( 'Wee CRPG        $10', 0.5, 0.5 )

    for( let i = 1; i < 10; i++ ){
      drawText( i + '', 0.5, ( i * 2 ) + 0.5 )
    }

    requestAnimationFrame( draw )
  }

  draw()
})

}

s()