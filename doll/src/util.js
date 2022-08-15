export const loadSvg = async src => {
  const resp = await fetch( src )
  const text = await resp.text()
  const div = document.createElement( 'div' )

  div.innerHTML = text

  return div.firstElementChild
}

export const loadImg = src => new Promise( resolve => {
  const img = new Image()

  img.onload = () => resolve( img )
  img.src = src
})

export const ass = ( value, message = '' ) => {
  if( value === null ) throw Error( `Expected value, got null${ message ? ': ' + message : '' }` )
  if( value === undefined ) throw Error( `Expected value, got undefined${ message ? ': ' + message : '' }` )

  return value
}

export const randInt = exclMax => Math.floor( Math.random() * exclMax )

export const traverseDom = ( node, cb ) => {
  cb( node )

  for( const child of node.childNodes ){
    traverseDom( child, cb )
  }
}

export const pick = arr => arr[ randInt( arr.length ) ]

export const pickIndex = arr => randInt( arr.length )

export const reverseDom = ( node, deep = false ) => {
  if( node.childNodes === undefined || typeof node.append !== 'function' ) return

  const children = Array.from( node.childNodes ).reverse()

  for( const child of children ){    
    node.append( child )
    
    if( !deep ) continue

    reverseDom( child, true )
  }

  return node
}

export const randomHsl = () => {
  const hue = randInt( 360 )
  const sat = randInt( 80 ) + 10
  const lum = randInt( 80 ) + 10

  return [ hue, sat, lum ]
}

export const chance = c => Math.random() < c