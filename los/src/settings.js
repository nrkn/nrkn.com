import { __ver } from './consts.js'

const settings = {
  path: '/',
  history: [],
  historyIndex: -1,
  timeoffset: 0,
  promptCode: '$p$g',
  fg: '#17d',
  bg: '#eee',
  fontsize: 2,
  nextWindowId: 0
}

const settingsKey = () => 'settings-' + __ver

const saveSettings = () => {
  localStorage.setItem(settingsKey(), JSON.stringify(settings))
}

export const initSettings = () => {
  // if this ever goes far enough that we need to migrate state, do it here
  // by decrementing the current __ver and seeing if earlier states exists
  //
  // for now tho, don't worry

  const saved = localStorage.getItem(settingsKey())

  if (saved) {
    Object.assign(settings, JSON.parse(saved))
  }
}

export const $get = key => settings[key]

export const $set = (key, value) => {
  settings[key] = value

  saveSettings()
}

// helpers - more concise then eg $set( 'key', $get( 'key' ) + 1 )

// get helpers

export const $item = ( key, index ) => settings[key][index]

export const $len = key => settings[key].length

export const $nextWinId = () => {
  const id = settings.nextWindowId++

  saveSettings()

  return id
}

// set helpers

export const $inc = (key, value = 1) => {
  settings[key] += value

  saveSettings()
}

export const $dec = (key, value = 1) => {
  settings[key] -= value

  saveSettings()
}

export const $push = (key, value) => {
  settings[key].push(value)

  saveSettings()
}
