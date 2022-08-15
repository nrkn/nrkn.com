import { attr, h } from './lib/dom.js'
import { clamp, clone } from './lib/util.js'

import { inputs, startInputs } from './inputs.js'
import { startView, view } from './view.js'
import { camera, setCamera } from './camera.js'
import { startTicker } from './ticker.js'
import { createBackgroundSvg, createSvg, randPolyline } from './map.js'
import { scale, translate } from './lib/geo.js'

const width = 50000
const height = 5000
const friction = 0.8

const playerRadius = 50
const playerOriginX = 0
const playerOriginY = -playerRadius
//const playerSpeed = 0.075
const playerSpeed = 0.25
//const playerSpeed = 0.75

//const xMargin = width / 10
//const xMargin = playerRadius * 1.1
const xMargin = ( playerRadius * 1.1 ) | 0

const bobSpeed = 0.0008
const bobAmount = 8

const cloudW = 0.4
const cloudH = 1
const cloudX = 0.4
const cloudY = 1

const farW = 0.5
const farH = 1
const farX = 0.5
const farY = 1

const midW = 0.6
const midH = 1
const midX = 0.6
const midY = 1

const frontW = 1.1
const frontH = 1
const frontX = 1.1
const frontY = 1

const backgroundHeight = 1000

const start = async () => {
  //let playerX = width / 2
  let playerX = xMargin
  let xVelocity = 0
  let yBob = 0

  /* 
    2000  ##### clouds  2125
          #   # far     2250
    2500  #   # mid     2375
          #   # base    2500
    3000  ##### front   2750
  */

  const cloudPolyline = randPolyline( width * cloudW, backgroundHeight ).map( p => translate( p, { y: 1700 }))
  const { backgroundSvgEl: cloudEl } = createBackgroundSvg(width * cloudW, height, '#fff', cloudPolyline)

  const farLine = randPolyline(width * farW, backgroundHeight).map( p => translate( p, { y: 1800 }))
  const { backgroundSvgEl: farEl } = createBackgroundSvg(width * farW, height, '#0c6', farLine)

  const midLine = randPolyline(width * midW, backgroundHeight).map( p => translate( p, { y: 1900 }))
  const { backgroundSvgEl: midEl } = createBackgroundSvg(width * midW, height, '#1d7', midLine)

  
  // --

  const polyline = randPolyline(width, backgroundHeight ).map( p => translate( p, { y: 2000 } ) )
  const { svgEl, polylineEl, playerEl } = createSvg(width, height, playerRadius, polyline)

  const frontLine = polyline.map( p => scale( p, { x: frontW, y: 1 } ) ).map( p => translate( p, { y: 250 } ) )
  const { backgroundSvgEl: frontEl } = createBackgroundSvg(width * frontW, height, '#4fa', frontLine)




  // backgroundSvgEl.style.transformOrigin = 'center'
  // backgroundSvg2El.style.transformOrigin = 'center'
  // frontEl.style.transformOrigin = 'center'
  // frontEl.style.filter = 'blur( 2px )'
  frontEl.style.opacity = '0.75'
  cloudEl.style.filter = 'blur( 16px )'
  cloudEl.style.opacity = '0.95'
  // backgroundSvgEl.style.filter = 'blur( 1px )'
  //backgroundSvgEl.style.opacity = '0.95'
  // backgroundSvg2El.style.filter = 'blur( 2px )'
  //backgroundSvg2El.style.opacity = '0.9'

  // const containerEl = h(
  //   'div',
  //   // {
  //   //   style: {
  //   //     margin: 'auto',
  //   //     width: '100vmin',
  //   //     height: '100vmin',
  //   //     outline: '1px solid #fff',
  //   //     position: 'relative',
  //   //     top: '50vh',
  //   //     marginTop: '-50vmin'
  //   //   }
  //   // }, 
  //   cloudEl, farEl, midEl, 
  //   svgEl,
  //   frontEl
  // )

  document.body.append(
    cloudEl, farEl, midEl, 
    svgEl,
    frontEl    
  )

  const headEl = h(
    'header',
    h('h1', 'catpatplat')
  )

  document.body.append(headEl)

  const _trans = (x, y) => `translate( ${x}px, ${y}px )`

  const applyCamera = () => {
    const viewScale = (view.vmin * 5) / height

    const x = view.bottomThird.x - (camera.x * viewScale)
    const y = view.bottomThird.y - (camera.y * viewScale)

    svgEl.style.transform = _trans(x | 0, y | 0)

    const clx = ( x * cloudX ) | 0
    const cly = ( y * cloudY ) | 0
    cloudEl.style.transform = _trans( clx, cly )

    const fx = ( x * farX ) | 0
    const fy = ( y * farY ) | 0
    farEl.style.transform = _trans( fx, fy )

    const mx = (x * midX ) | 0
    const my = (y * midY ) | 0
    midEl.style.transform = _trans( mx, my )

    const frx = ( x * frontX ) | 0
    const fry = ( y * frontY ) | 0    
    frontEl.style.transform = _trans( frx, fry )
  }

  const setPlayerX = value => {
    playerX = clamp(value, xMargin, polylineEl.getTotalLength() - xMargin)

    const playerPoint = polylineEl.getPointAtLength(playerX)

    let { x, y } = playerPoint

    x += playerOriginX
    y += playerOriginY + yBob

    attr(playerEl, { cx: x | 0, cy: y | 0 })

    setCamera({ x, y })
    applyCamera()
  }

  const onTick = (elapsed, time) => {
    // how to do with time?
    // xVelocity *= ( friction / ( elapsed / ( 1 / 60 ) ) )
    xVelocity *= friction

    yBob = Math.sin(time * bobSpeed) * bobAmount

    if (inputs.left) xVelocity -= (elapsed * playerSpeed)
    if (inputs.right) xVelocity += (elapsed * playerSpeed)

    setPlayerX(playerX + xVelocity)
  }

  startView()
  startInputs()
  startTicker(onTick)
}

start().catch(err => alert(err?.message ?? 'unknown error'))
