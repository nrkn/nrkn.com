const isSeparator = ch => /\s/.test(ch)

const escapeChar = '\\'

export const parseArgs = args => {
  const parsed = []

  let inString = false
  let current = ''

  const chars = args.split('')

  for( let i = 0; i < chars.length; i++ ){
    const ch = chars[ i ]

    if( ch === escapeChar ){
      const next = chars[ i + 1 ]

      if( next === escapeChar || next === '"' ){
        current += next
        i++
      } else if( next === '$' ){
        current += next
        i++
      } else {
        current += ch
      }
    } else if( ch === '"' ){
      inString = !inString
    } else if( !inString && isSeparator( ch ) ){
      if( current ){
        parsed.push( current )
        current = ''
      }
    } else {
      current += ch
    }
  }

  if( current ){
    parsed.push( current )
  }

  return parsed
}
