export const ass = value => {
  if( value === null ) throw Error( 'Unexpected null' )
  if( value === undefined ) throw Error( 'Unexpected undefined' )

  return value
}

export const clamp = ( value = 0, min = 0, max = 1 ) => Math.min( Math.max( value, min ), max )

export const clone = value => JSON.parse( JSON.stringify( value ) )
