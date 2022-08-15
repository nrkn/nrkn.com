export const camera = { x: 0, y: 0 }

export const setCamera = ( {x, y} = { x: 0, y: 0 }) => {
  Object.assign( camera, { x, y } )
}
