import { $get, $set } from './settings.js'
import { updateStyleView } from './style.js'
import { keyValuePair } from './util.js'
import { wline } from './output.js'

const minFontSize = 0.25
const maxFontSize = 10

export const fontsizeHelp = () => [
  'Displays or sets the system font size.\n',
  'FONTSIZE [size]\n',
  keyValuePair(
    'size',
    `Specify a new font size, between ${minFontSize} and ${maxFontSize}.\n`
  ),
  'Type FONTSIZE without parameters to display the current font size.\n'
]

export const fontsizeCommand = arg => {
  if (arg === undefined) {
    wline($get('fontsize'))

    return
  }

  if (arg === '/?') {
    wline(fontsizeHelp().join('\n'))

    return
  }

  let newSize = Number(arg)

  if (isNaN(newSize)) {
    wline('Invalid font size')

    return
  }

  if (newSize > maxFontSize) newSize = maxFontSize
  if (newSize < minFontSize) newSize = minFontSize

  $set('fontsize', newSize)
  updateStyleView()
}
