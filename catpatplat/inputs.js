import { view } from './view.js'

export const inputs = {
  left: false, 
  right: false
}

const keydown = e => {
  if (e.key === 'ArrowLeft') inputs.left = true
  if (e.key === 'ArrowRight') inputs.right = true
  if (e.key === 'a') inputs.left = true
  if (e.key === 'd') inputs.right = true
  if (e.key === 'A') inputs.left = true
  if (e.key === 'D') inputs.right = true
  if( e.key === '4') inputs.left = true
  if( e.key === '6') inputs.right = true
}

const keyup = e => {
  if (e.key === 'ArrowLeft') inputs.left = false
  if (e.key === 'ArrowRight') inputs.right = false
  if (e.key === 'a') inputs.left = false
  if (e.key === 'd') inputs.right = false
  if (e.key === 'A') inputs.left = false
  if (e.key === 'D') inputs.right = false
  if( e.key === '4') inputs.left = false
  if( e.key === '6') inputs.right = false
}

const touchStart = e => {
  e.preventDefault()

  const [touch] = e.touches

  if( !touch ) return

  const isLeft = touch.pageX <= view.center.x

  if (isLeft) {
    inputs.left = true
  } else {
    inputs.right = true
  }
}

const generalEnd = e => {
  e.preventDefault()

  inputs.left = false
  inputs.right = false
}

const mouseDown = e => {
  e.preventDefault()

  console.log( { e })

  const isLeft = e.clientX <= view.center.x

  if (isLeft) {
    inputs.left = true
  } else {
    inputs.right = true
  }
}

let ticking = false
const pressed = {}

const padDown = index => {
  if( index === 14 ) inputs.left = true
  if( index === 15 ) inputs.right = true
}

const padUp = index => {
  if( index === 14 ) inputs.left = false
  if( index === 15 ) inputs.right = false    
}

const tickGamepad = () => {
  if( !ticking ) return

  const [ gamepad ] = navigator.getGamepads()

  if( gamepad ){
    for( let i = 0; i < gamepad.buttons.length; i++ ){
      const button = gamepad.buttons[ i ]

      if( !button.pressed ){
        if( pressed[ i ] ){
          pressed[ i ] = false
          padUp( i )
        }
        continue
      }

      if( !pressed[ i ] ){
        pressed[ i ] = true
        padDown( i )
      }
    }
  }

  requestAnimationFrame( tickGamepad )
}

export const startInputs = () => {
  window.addEventListener('keydown', keydown)
  window.addEventListener('keyup', keyup)
  window.addEventListener( 'touchstart', touchStart )
  window.addEventListener( 'touchend', generalEnd )
  window.addEventListener( 'touchcancel', generalEnd )
  window.addEventListener( 'mousedown', mouseDown )
  window.addEventListener( 'mouseup', generalEnd )

  ticking = true

  requestAnimationFrame( tickGamepad )
}

export const stopInputs = () => {
  window.removeEventListener('keydown', keydown)
  window.removeEventListener('keyup', keyup)
  window.removeEventListener( 'touchstart', touchStart )
  window.removeEventListener( 'touchend', generalEnd )
  window.removeEventListener( 'touchcancel', generalEnd )
  window.removeEventListener( 'mousedown', mouseDown )
  window.removeEventListener( 'mouseup', generalEnd )

  ticking = false
}
