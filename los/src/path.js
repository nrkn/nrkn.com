// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

const normalizeArray = (parts, allowAboveRoot) => {
  const res = []

  for (let i = 0; i < parts.length; i++) {
    const p = parts[i]

    if (!p || p === '.') continue

    if (p === '..') {
      if (res.length && res[res.length - 1] !== '..') {
        res.pop()
      } else if (allowAboveRoot) {
        res.push('..')
      }
    } else {
      res.push(p)
    }
  }

  return res
}

const trimArray = arr => {
  const lastIndex = arr.length - 1
  let start = 0

  for (; start <= lastIndex; start++) {
    if (arr[start]) break
  }

  let end = lastIndex

  for (; end >= 0; end--) {
    if (arr[end]) {
      break
    }
  }

  if (start === 0 && end === lastIndex) {
    return arr
  }
  if (start > end) {
    return []
  }

  return arr.slice(start, end + 1)
}

const splitPathRe =
  /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/

const posixSplitPath = filename => splitPathRe.exec(filename).slice(1)

export const resolve = (...args) => {
  let resolvedPath = ''
  let resolvedAbsolute = false

  for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    const path = (i >= 0) ? args[i] : '/'

    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings')
    } else if (!path) {
      continue
    }

    resolvedPath = path + '/' + resolvedPath
    resolvedAbsolute = path[0] === '/'
  }

  resolvedPath = normalizeArray(resolvedPath.split('/'),
    !resolvedAbsolute).join('/')

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.'
}

export const normalize = path => {
  const isAbs = isAbsolute(path)
  const trailingSlash = path && path[path.length - 1] === '/'

  path = normalizeArray(path.split('/'), !isAbs).join('/')

  if (!path && !isAbs) {
    path = '.'
  }

  if (path && trailingSlash) {
    path += '/'
  }

  return (isAbs ? '/' : '') + path
}

export const isAbsolute = path => path.charAt(0) === '/'

export const join = (...args) => {
  let path = ''
  for (let i = 0; i < args.length; i++) {
    const segment = args[i]
    if (typeof segment !== 'string') {
      throw new TypeError('Arguments to path.join must be strings')
    }
    if (segment) {
      if (!path) {
        path += segment
      } else {
        path += '/' + segment
      }
    }
  }

  return normalize(path)
}

export const relative = (from, to) => {
  from = resolve(from).slice(1)
  to = resolve(to).slice(1)

  const fromParts = trimArray(from.split('/'))
  const toParts = trimArray(to.split('/'))

  const length = Math.min(fromParts.length, toParts.length)
  let samePartsLength = length

  for (let i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i
      break
    }
  }

  let outputParts = []
  for (let i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..')
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength))

  return outputParts.join('/')
}

export const dirname = (path) => {
  const result = posixSplitPath(path)
  const root = result[0]
  let dir = result[1]

  if (!root && !dir) {
    return '.'
  }

  if (dir) {
    dir = dir.slice(0, -1)
  }

  return root + dir
}

export const basename = (path, ext) => {
  let f = posixSplitPath(path)[2]

  if (ext && f.endsWith(ext)) {
    f = f.slice(0, -1 * ext.length)
  }

  return f
}

export const extname = path => posixSplitPath(path)[3]

export const format = pathObject => {
  const otype = typeof pathObject

  if (otype !== 'object' || pathObject === null) {
    throw new TypeError(
      "Parameter 'pathObject' must be an object, not " + typeof pathObject
    )
  }

  const root = pathObject.root || ''

  if (typeof root !== 'string') {
    throw new TypeError(
      "'pathObject.root' must be a string or undefined, not " +
      typeof pathObject.root
    )
  }

  const dir = pathObject.dir ? pathObject.dir + sep : ''
  const base = pathObject.base || ''
  return dir + base
}

export const parse = pathString => {
  if (typeof pathString !== 'string') {
    throw new TypeError(
      "Parameter 'pathString' must be a string, not " + typeof pathString
    )
  }

  const allParts = posixSplitPath(pathString)
  
  if (!allParts || allParts.length !== 4) {
    throw new TypeError("Invalid path '" + pathString + "'")
  }

  allParts[1] = allParts[1] || ''
  allParts[2] = allParts[2] || ''
  allParts[3] = allParts[3] || ''

  return {
    root: allParts[0],
    dir: allParts[0] + allParts[1].slice(0, -1),
    base: allParts[2],
    ext: allParts[3],
    name: allParts[2].slice(0, allParts[2].length - allParts[3].length)
  }
}

const sep = '/'
