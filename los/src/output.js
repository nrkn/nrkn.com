import { outView } from './dom.js'

export const wline = (text = '') => {
  outView.innerHTML += `${text}\n`
  outView.scrollTop = outView.scrollHeight
}

// for now, we may eg style it differently later
export const werr = wline
