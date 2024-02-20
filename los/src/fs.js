import { __ver } from './consts.js'
import { dbGet, dbSet } from './db.js'

import {
  normalize, join, dirname, basename
} from './path.js'

const dbFileKey = path => `fs_${__ver}_file_${normalize(path)}`

// errors - we have no perms etc for now, so just the basics

const enoent = path => {
  throw Error(`ENOENT: no such file or directory, ${path}`)
}

const eexist = path => {
  throw Error(`EEXIST: file already exists, ${path}`)
}

const eisdir = path => {
  throw Error(`EISDIR: illegal operation on a directory, ${path}`)
}

const enotdir = path => {
  throw Error(`ENOTDIR: expected a directory, ${path}`)
}

const enotempty = path => {
  throw Error(`ENOTEMPTY: directory not empty, ${path}`)
}

// 

export const ensureFsRoot = async () => {
  const entry = await dbGet(dbFileKey('/'))

  if (entry === undefined) {
    await dbSet(dbFileKey('/'), [])
  }
}

const getEntry = path => dbGet(dbFileKey(path))

const setEntry = async (path, entry) => {
  if (normalize(path) === '/') {
    throw Error(`Cannot write to root directory`)
  }

  await dbSet(dbFileKey(path), entry)
}

// file must either not exist, or be a file, and the parent path must be a 
// directory
const assertCanWriteFile = async path => {
  const existing = await getEntry(path)

  if (existing === undefined) return true

  if (Array.isArray(existing)) eisdir(path)

  const parentPath = dirname(path)
  const parent = await getEntry(parentPath)

  if (!Array.isArray(parent)) enotdir(parentPath)
}

const addToParent = async path => {
  const selfFilename = basename(path)
  const parentPath = dirname(path)

  const parent = await getEntry(parentPath)

  if (!Array.isArray(parent)) enotdir(parentPath)

  if (parent.includes(selfFilename)) return

  parent.push(selfFilename)

  // can't use setEntry - disallows writing to root - ok for us to do it tho
  await dbSet(dbFileKey(parentPath), parent)
}

const removeFromParent = async path => {
  const selfFilename = basename(path)
  const parentPath = dirname(path)

  const parent = await getEntry(parentPath)

  if (!Array.isArray(parent)) enotdir(parentPath)

  const childIndex = parent.indexOf(selfFilename)

  if (childIndex === -1) enoent(path)

  parent.splice(childIndex, 1)

  await setEntry(parentPath, parent)
}

const assertFileData = data => {
  if (isBlob(data) || isText(data)) return

  throw Error(`A file must be a Blob or a string`)
}

const isBlob = data => data instanceof Blob
const isText = data => typeof data === 'string'

//

export const stat = async path => {
  const entry = await getEntry(path)

  if (entry === undefined) enoent(path)

  let type
  let size = 0

  // we expect one of three types
  if (Array.isArray(entry)) {
    // an array of strings
    type = 'directory'
  } else if (isBlob(entry)) {
    // a Blob
    type = 'file'
    size = entry.size
  } else if (isText(entry)) {
    // a string
    type = 'text'
    size = entry.length
  } else {
    throw Error(`Unknown entry type`)
  }

  return { type, size }
}

export const writeFile = async (path, data) => {
  assertCanWriteFile(path)
  assertFileData(data)

  if( isBlob( data ) ){
    let options = {}

    if( data.type ){
      options.type = data.type
    }

    data = new File( [ data ], basename( path ), options )
  }

  await setEntry(path, data)
  await addToParent(path)
}

export const readFile = async path => {
  const entry = await dbGet(dbFileKey(path))

  if (Array.isArray(entry)) eisdir(path)

  return entry
}

// I think this should enforce the correct enotdir etc errors
export const copyFile = async (src, dest) => {
  const srcEntry = await readFile(src)

  await writeFile(dest, srcEntry)
}

export const readdir = async path => {
  const entry = await getEntry(path)

  if (!Array.isArray(entry)) enotdir(path)

  return entry
}

export const unlink = async path => {
  const existing = await getEntry(path)

  if (existing === undefined) enoent(path)

  if (Array.isArray(existing)) eisdir(path)

  await setEntry(path, undefined)
  await removeFromParent(path)
}

export const rename = async (oldPath, newPath) => {
  await copyFile(oldPath, newPath)
  await unlink(oldPath)
}

export const mkdir = async (path, recursive = false) => {
  if (!recursive) {
    const parentPath = dirname(path)
    const parent = await getEntry(parentPath)

    if (!Array.isArray(parent)) enotdir(parentPath)
    if (parent.includes(basename(path))) eexist(path)

    await setEntry(path, [])
    await addToParent(path)
  } else {
    const pathParts = path.split('/').filter(p => p)
    let currentPath = ''

    for (const part of pathParts) {
      currentPath = join(currentPath, part)
      const entry = await getEntry(currentPath)

      if (entry === undefined) {
        await setEntry(currentPath, [])
        await addToParent(currentPath)
      } else if (!Array.isArray(entry)) {
        eexist(currentPath)
      }
    }
  }
}

export const rmdir = async (path, recursive = false) => {
  const entry = await getEntry(path)

  if (!Array.isArray(entry)) enotdir(path)

  if (!recursive && entry.length > 0) enotempty(path)

  if (recursive) {
    for (const childName of entry) {
      const childPath = join(path, childName)
      const childEntry = await getEntry(childPath)

      if (Array.isArray(childEntry)) {
        await rmdir(childPath, true)
      } else {
        await unlink(childPath)
      }
    }
  }

  await setEntry(path, undefined)
  await removeFromParent(path)
}

export const rm = async (path, recursive = false, force = false) => {
  try {
    const entry = await getEntry(path)

    if (Array.isArray(entry)) {
      await rmdir(path, recursive)
    } else {
      await unlink(path)
    }
  } catch (error) {
    if (!force) throw error
  }
}
