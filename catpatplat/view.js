const bounds = document.body.getBoundingClientRect()
const center = { x: bounds.width * 0.5, y: bounds.height * 0.5 }
const bottomThird = { x: bounds.width * 0.5, y: bounds.height * 0.666 }
const vmin = Math.min( bounds.width, bounds.height )

const onResize = () => {
  view.bounds = document.body.getBoundingClientRect()
  view.center = { x: view.bounds.width * 0.5, y: view.bounds.height * 0.5 }
  view.bottomThird = { x: view.bounds.width * 0.5, y: view.bounds.height * 0.666 }
  view.vmin = Math.min( view.bounds.width, view.bounds.height )
}

export const view = { bounds, center, bottomThird, vmin }

export const startView = () => {
  window.addEventListener('resize', onResize)  
}

export const stopView = () => {
  window.removeEventListener( 'resize', onResize )
}
