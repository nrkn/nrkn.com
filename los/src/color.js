import { $get, $set } from './settings.js'
import { updateStyleView } from './style.js'
import { keyValuePair } from './util.js'
import { werr, wline } from './output.js'

const helpMap = {
  fg: {
    desc: 'foreground',
    cmd: 'FG'
  },
  bg: {
    desc: 'background',
    cmd: 'BG'
  }
}

const colorHelp = fgOrBg => [
  `Displays or sets the terminal ${helpMap[fgOrBg].desc} color.\n`,
  `${helpMap[fgOrBg].cmd} [color]\n`,
  keyValuePair('color', `Specify ${helpMap[fgOrBg].desc} using a CSS color.\n`),
  `Type ${helpMap[fgOrBg].cmd} without parameters to display the current ${helpMap[fgOrBg].desc} color.\n`
]

// todo simple - disallow setting fg/bg to the same color
// todo advanced - check for contrast and disallow if it's too low, with a force
// parameter to override
const colorCmd = (fgOrBg, arg) => {
  if (arg === undefined || arg.trim() === '') {
    wline($get(fgOrBg))

    return
  }

  if (arg === '/?') {
    wline(colorHelp(fgOrBg).join('\n'))

    return
  }

  if (!CSS.supports('color', arg)) {
    werr(`Invalid CSS color`)

    return
  }

  $set(fgOrBg, arg)
  updateStyleView()
}

export const fgHelp = () => colorHelp('fg')

export const fgCommand = arg => colorCmd('fg', arg)

export const bgHelp = () => colorHelp('bg')

export const bgCommand = arg => colorCmd('bg', arg)
