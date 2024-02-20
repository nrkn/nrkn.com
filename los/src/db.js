import { __ver } from './consts.js'

const dbName = 'LOS-DB'

// stores can take a version number, but our version is stored as semver
// 
// maybe later we will convert the semver to a number, but for now just stick it 
// in the store name and don't use versioning
const storeName = dbName + __ver

let db

export const openDb = () => new Promise((resolve, reject) => {
  if( db ){
    resolve( db )
    
    return
  }

  // see above regards version
  const request = indexedDB.open(dbName, 1)

  request.onerror = () => {
    reject(request.error)
  }

  request.onsuccess = () => {
    db = request.result
    
    resolve(db)
  }

  request.onupgradeneeded = () => {
    db = request.result

    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName)
    }
  }
})

export const dbGet = key =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.get(key)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })

export const dbSet = (key, val) =>
  new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.put(val, key)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
