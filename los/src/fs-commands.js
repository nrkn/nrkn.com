import { inView } from './dom.js'
import { mkdir, readFile, readdir, stat, writeFile } from './fs.js'
import { basename, isAbsolute, join, normalize } from './path.js'
import { updatePromptView } from './prompt.js'
import { $get, $set } from './settings.js'
import { assrt } from './util.js'
import { wline } from './output.js'

export const cdCommand = async path => {
  if (path === undefined || path.trim() === '') {
    wline($get('path'))

    return
  }

  if (!isAbsolute(path)) {
    path = join($get('path'), path)
  }

  const s = await stat(path)

  if (s.type !== 'directory') {
    wline('Not a directory')

    return
  }

  $set('path', normalize(path))
  updatePromptView()
}

export const lsCommand = async (path = $get('path')) => {
  try {
    path = isAbsolute(path) ? path : join($get('path'), path)

    const names = await readdir(path)

    console.log(JSON.stringify(names))

    if (names.length === 0) {
      wline('&lt;empty>')

      return
    }

    const outNames = []

    for (const name of names) {
      const p = join(path, name)
      const s = await stat(p)

      const outName = s.type === 'directory' ? name + '/' : name

      outNames.push(outName)
    }

    wline(outNames.join('\n'))
  } catch (err) {
    wline(err.message)
    console.error(err)
  }
}

export const mkdirCommand = async path => {
  try {
    if (isAbsolute(path)) {
      await mkdir(path)
    } else {
      await mkdir(join($get('path'), path))
    }
  } catch (err) {
    wline(err.message)
    console.error(err)
  }
}

export const uploadCommand = async filename => {
  inView.type = 'file'

  const onFile = async e => {
    try {
      const file = assrt(e.target.files[0], 'Expected a file')

      filename = filename || file.name

      const filepath = (
        isAbsolute(filename) ?
          filename :
          join($get('path'), filename)
      )

      await writeFile(filepath, file)

      wline('Uploaded ' + filename)
    } catch (err) {
      wline(err.message)
      console.error(err)
    } finally {
      onCancel()
    }
  }

  const onCancel = () => {
    inView.type = 'text'
    inView.removeEventListener('change', onFile)
    inView.removeEventListener('cancel', onCancel)
  }

  inView.addEventListener('change', onFile)
  inView.addEventListener('cancel', onCancel)
  inView.click()
}

const getBlob = async path => {
  if (!isAbsolute(path)) {
    path = join($get('path'), path)
  }

  const s = await stat(path)

  let blob

  if (s.type === 'directory') {
    const filenames = await readdir(path)
    const asText = filenames.join('\n')

    blob = new Blob([asText], { type: 'text/plain' })
  } else if (s.type === 'text') {
    const entry = await readFile(path)

    blob = new Blob([entry], { type: 'text/plain' })
  } else if (s.type === 'file') {
    // already a blob
    blob = await readFile(path)
  } else {
    throw Error(`Unknown entry type`)
  }

  return blob
}

// same as getBlob, but ensures that the filename matches the filename from path
const getFile = async path => {
  const blob = await getBlob(path)

  let options = {}

  if (blob.type) {
    options.type = blob.type
  }

  return new File([blob], basename(path), options)
}

export const viewCommand = async path => {
  try {
    const file = await getFile(path)
    const url = URL.createObjectURL(file)

    window.open(url)
  } catch (err) {
    wline(err.message)
    console.error(err)
  }
}

export const downloadCommand = async path => {
  try {
    const file = await getFile(path)
    const link = document.createElement('a')

    link.href = URL.createObjectURL(file)
    link.download = basename(path)

    link.click()
  } catch (err) {
    wline(err.message)
    console.error(err)
  }
}

export const mimeTypeCommand = async path => {
  try {
    path = isAbsolute(path) ? path : join($get('path'), path)

    const s = await stat(path)

    if (s.type === 'directory') {
      wline('inode/directory')

      return
    } else if (s.type === 'text') {
      wline('text/plain')

      return
    } else if (s.type === 'file') {
      const file = await getFile(path)

      wline(file.type || 'Unknown mime type :(')

      return
    } else {
      throw Error(`Unknown entry type`)
    }
  } catch (err) {
    wline(err.message)
    console.error(err)
  }
}

// eg  "65,200 bytes"
export const formatAsBytes = value => {
  value = Number(value)

  if (isNaN(value)) {
    throw Error(`Expected a number, got ${value}`)
  }

  const units = ['bytes', 'KB', 'MB', 'GB', 'TB']

  let unit = 0

  while (value >= 1024) {
    value /= 1024
    unit++
  }

  const currentUnit = units[unit]

  value = currentUnit === 'bytes' ? Math.floor(value) : value.toFixed(2)

  return `${value} ${units[unit]}`
}

export const freeCommand = async () => {
  try {
    const est = await navigator.storage.estimate()

    const { quota, usage } = est

    if (quota && usage) {
      const used = formatAsBytes(usage)
      const total = formatAsBytes(quota)

      wline(used)
      wline(total + ' free')
    } else {
      throw Error(`Could not get storage estimate`)
    }
  } catch (err) {
    wline(err.message)
    console.error(err)
  }
}