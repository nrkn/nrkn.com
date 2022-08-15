import { blitBitmap } from './bitmap.js'

export const drawList = (dest, list, dx = 0, dy = 0) => {
  for (const draw of list.drawList) {
    const { bitmap, x, y } = draw
    const { width, height } = bitmap

    blitBitmap(bitmap, dest, 0, 0, width, height, x + dx, y + dy)
  }
}

export const translateList = ( drawList, xOff = 0, yOff = 0 ) => drawList.map(
  ({ x, y, bitmap }) => {
    x += xOff
    y += yOff

    return { x, y, bitmap }
  }
)

export const alignListRight = (list, alignTo) => {
  let { right, bottom, drawList } = list

  const xOff = alignTo - right

  drawList = translateList( drawList, xOff, 0 )

  return { right, bottom, drawList }
}

export const alignListCenter = (list, alignTo) => {
  let { right, bottom, drawList } = list

  const xOff = Math.floor((alignTo - right) / 2)

  drawList = translateList( drawList, xOff, 0 )

  return { right, bottom, drawList }
}

export const alignListBottom = ( list, alignTo ) => {
  let { right, bottom, drawList } = list

  const yOff = alignTo - bottom

  drawList = translateList( drawList, 0, yOff )

  return { right, bottom, drawList }
}

export const alignListMiddle = ( list, alignTo ) => {
  let { right, bottom, drawList } = list

  const yOff = Math.floor(( alignTo - bottom ) / 2 )

  drawList = translateList( drawList, 0, yOff )

  return { right, bottom, drawList }
}

export const align = ( list, alignTo, ...alignment ) => {
  for( const a of alignment ){
    if( a === 'center' ){
      list = alignListCenter( list, alignTo.right )
    }

    if( a === 'right' ){
      list = alignListRight( list, alignTo.right )
    }

    if( a === 'bottom' ){
      list = alignListBottom( list, alignTo.bottom )
    }

    if( a === 'middle' ){
      list = alignListMiddle( list, alignTo.bottom )
    }    
  }

  return list
}