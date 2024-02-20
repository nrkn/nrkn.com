export const inForm = document.querySelector('form')
export const inView = document.querySelector('input')
export const outView = document.querySelector('pre')
export const promptView = document.querySelector('#prompt')

//

export const div = ( ...args ) => h( 'div', ...args )
export const h1 = ( ...args ) => h( 'h1', ...args )
export const ul = ( ...args ) => h( 'ul', ...args )
export const ol = ( ...args ) => h( 'ol', ...args )
export const li = ( ...args ) => h( 'li', ...args )
export const button = ( ...args ) => h( 'button', ...args )

//

export const h = (localName, ...args) =>
  updateEl(document.createElement(localName), ...args)

export const updateEl = (el, ...args) => {
  for (const arg of args) {
    if (handleAppend(el, arg)) continue
    if (handleRecord(el, arg)) continue

    throw Error(`Invalid argument ${arg}`)
  }

  return el
}

const isAppendArg = arg =>
  typeof arg === 'string' || arg instanceof Node

const isRecord = arg =>
  typeof arg === 'object' && arg !== null && (arg.nodeType === undefined)

const handleAppend = (el, arg) => {
  if (isAppendArg(arg)) {
    el.append(arg)

    return true
  }

  return false
}

const handleBoolish = (el, key, value) => {
  if (typeof value === 'boolean' || value === null || value === undefined) {
    if (value) {
      el.setAttribute(key, '')
    } else {
      el.removeAttribute(key)
    }

    return true
  }

  return false
}

const handleStyle = (el, key, value) => {
  if (key === 'style') {
    Object.assign(el.style, value)

    return true
  }

  return false
}

const handleData = (el, key, value) => {
  if (key === 'data') {
    for (const dataKey in value) {
      el.dataset[dataKey] = value[dataKey]
    }

    return true
  }

  return false
}

const handleRecord = (el, arg) => {
  if (isRecord(arg)) {
    for (const key in arg) {
      let value = arg[key]

      if (handleBoolish(el, key, value)) continue

      if (isRecord(value)) {
        if (handleStyle(el, key, value)) continue
        if (handleData(el, key, value)) continue

        throw Error(`Invalid record for attribute ${key}: ${value}`)
      }

      if (typeof value === 'number') value = String(value)

      // eg an array of string for classes, or viewBox on svg etc
      if (Array.isArray(value)) value = value.join(' ')

      if (typeof value !== 'string') {
        throw Error(`Invalid value for attribute ${key}: ${value}`)
      }
      
      el.setAttribute(key, value)
    }

    return true
  }

  return false
}
