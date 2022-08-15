const _scale = (a, b) => a * b
const _translate = (a, b) => a + b

const transform = op =>
  (s, options) => {
    const result = Object.assign( {}, s )

    for (const key in options) {
      if (key in s) {
        result[key] = op(result[key], options[key])
      }
    }

    return result
  }

export const scale = transform(_scale)

export const translate = transform(_translate)
