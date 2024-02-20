import { outView } from './dom.js'
import { $get } from './settings.js'

export const updateStyleVar = ( key, value ) => {
  document.documentElement.style.setProperty( key, value )
}

export const updateStyleView = () => {
  const fg = $get( 'fg' )
  const bg = $get( 'bg' )
  const fontsize = $get( 'fontsize' )

  updateStyleVar( '--fg-color', fg )
  updateStyleVar( '--bg-color', bg )
  updateStyleVar( '--font-size', fontsize + 'vw' )
  
  outView.scrollTop = outView.scrollHeight
}
