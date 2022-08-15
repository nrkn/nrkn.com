export const $ = (name = 'div') => document.createElement(name)
export const $$ = (name = 'svg') => document.createElementNS('http://www.w3.org/2000/svg', name)

const _attr = (el, key = 'id', value = undefined) => {
  if (value !== undefined) el.setAttribute(key, value)

  return el.getAttribute(key)
}

export const select = (selector, parent = document) => {
  const el = parent.querySelector(selector)

  if (!el) throw Error(`Expected "${selector}"`)

  return el
}

export const attr = ( el, ...args ) => {
  for (const arg of args) {
    if (typeof arg === 'string' || arg instanceof Node) {
      el.append(arg)

      continue
    }

    for (const key in arg) {
      const value = arg[key]

      if( typeof value === 'string' ){
        _attr( el, key, value )

        continue
      }

      if( typeof value === 'number' ){
        _attr( el, key, String( value ) )

        continue
      }

      if( typeof value === 'boolean' ){
        if( value ){
          _attr( el, key, '' )            
        } 

        continue
      }

      if( Array.isArray( value ) ){
        _attr( el, key, value.join( ' ' ) )

        continue
      }

      if (key === 'style') {
        Object.assign(el.style, value)

        continue
      }

      if (key === 'data') {
        Object.assign(el.dataset, value)

        continue
      }

      if (typeof value === 'function') {
        el.addEventListener(key, value)

        continue
      }

      throw Error( `Unexpected value for ${ key }: ${ value }` )
    }
  }

  return el
}

const createEl = ( create, elName ) =>
  (name = elName, ...args) => {
    const el = create(name)
    
    return attr( el, ...args )
  }

export const h = createEl( $, 'div' )

export const s = createEl( $$, 'svg' )

export const parse = html => {
  const temp = $()

  temp.innerHTML = html

  const f = document.createDocumentFragment()

  f.append(...temp.children)

  return f
}

export const html = (strings, ...values) => {
  const { length } = strings
  const results = Array(length * 2)

  for (let i = 0; i < strings.length; i++) {
    const index = i * 2

    results[index] = strings[i]
    results[index + 1] = values[i]
  }

  return results.join('')
}

export const pointsToPathString = points => 
  points.map(({ x, y }, i )=> {
    if( i === 0 ) return `M${ x },${ y }`

    return `L${ x },${ y }`
  }).join( ' ' )