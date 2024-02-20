
export const keyValuePair = (key, value) =>
  `  ${key}    ${value}`

export const assrt = (
  value, message = 'Expected value, got null or undefined'
) => {
  if (value === null || value === undefined) {
    throw Error(message)
  }

  return value
}

export const randInt = exclMax => Math.floor(Math.random() * exclMax)

export const seq = ( length, map ) => Array.from({length}, (_, i) => map(i))
