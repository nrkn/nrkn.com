import { bgHelp, fgHelp } from './color.js'
import { fontsizeHelp } from './font.js'
import { promptHelp } from './prompt.js'
import { timeHelp } from './time.js'
import { wline } from './output.js'

const help = {
  prompt: promptHelp,
  time: timeHelp,
  ver: () => ['Displays the LOS version number.\n'],
  clear: () => ['Clears the screen.\n'],
  cls: () => help.clear(),
  fg: fgHelp,
  bg: bgHelp,
  fontsize: fontsizeHelp
}

const excludeFromHelp = ['help', 'debug', 'copyright']

export const debugHelp = (commands) => {
  const keys = Object.keys(commands)
  for (const key of keys) {
    if (excludeFromHelp.includes(key)) continue

    if (!(key in help)) {
      console.warn(`No help for ${key}`)
    }
  }
}

const helpDesc = {
  // the first line of the given help command is the description
  prompt: () => promptHelp()[0],
  time: () => timeHelp()[0],
  ver: () => help.ver()[0],
  clear: () => help.clear()[0],
  cls: () => help.cls()[0],
  fg: () => fgHelp()[0],
  bg: () => bgHelp()[0],
  fontsize: () => fontsizeHelp()[0]
}

export const helpCommand = arg => {
  if (typeof arg === 'string') {
    if (arg in help) {
      wline(help[arg]().join('\n'))
    } else {
      wline(`Unknown command`)
    }

    return
  }

  const keys = Object.keys(helpDesc).sort()

  // minimum length is 8
  let longestLen = 8

  for (const key of keys) {
    if (key.length > longestLen) {
      longestLen = key.length
    }
  }

  const keyLength = longestLen + 2

  wline('Type HELP [command] to get more info about a command.\n')

  for (const key of keys) {
    // the helpDesc will have a '\n' at end, remove it
    wline(key.padEnd(keyLength) + helpDesc[key]().trimEnd())
  }

  wline()
}
