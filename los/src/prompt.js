import { __ver } from './consts.js'
import { promptView } from './dom.js'
import { $get, $set } from './settings.js'
import { currentTime } from './time.js'
import { keyValuePair } from './util.js'
import { wline } from './output.js'

const promptCodes = {
  '$a': [() => '&', 'Ampersand'],
  '$b': [() => '|', 'Pipe'],
  '$c': [() => '(', 'Left Parenthesis'],
  '$d': [() => currentTime().toLocaleDateString(), 'Current Date'],
  '$f': [() => ')', 'Right Parenthesis'],
  '$g': [() => '>', 'Greater Than'],
  '$l': [() => '<', 'Less Than'],
  '$p': [() => $get('path'), 'Current Path'],
  '$q': [() => '=', 'Equals'],
  '$s': [() => ' ', 'Space'],
  '$t': [() => currentTime().toLocaleTimeString(), 'Current Time'],
  '$v': [() => __ver, 'LOS Version Number'],
  '$$': [() => '$', 'Dollar Sign']
}

export const promptHelp = () => [
  'Displays or sets the command prompt.\n',
  'PROMPT [text]\n',
  keyValuePair('text', 'Specifies a new command prompt.\n'),
  'Type PROMPT without parameters to display the current command prompt.\n',
  'May consist of normal characters and the following codes:\n',
  ...Object.keys(promptCodes).map(k => {
    const [_fn, desc] = promptCodes[k]

    return keyValuePair(k, desc)
  }),
  ''
]

const parsePromptCode = code => {
  code = String(code).trim().toLowerCase()

  if (code in promptCodes) {
    return promptCodes[code][0]()
  }
}

export const parsePrompt = prompt => {
  let parsed = ''

  for (let i = 0; i < prompt.length;) {
    const char = prompt[i]

    if (char === '$') {
      const code = prompt.slice(i, i + 2)
      const parsedCode = parsePromptCode(code)

      if (parsedCode) {
        parsed += parsedCode
        i += 2
      } else {
        parsed += char
        i++
      }
    } else {
      parsed += char
      i++
    }
  }

  return parsed
}

export const updatePromptView = () => {
  promptView.innerHTML = parsePrompt($get('promptCode'))
}

export const promptCommand = code => {
  if (code === undefined || code.trim() === '') {
    wline($get('promptCode'))

    return
  }

  if (code === '/?') {
    wline(promptHelp().join('\n'))

    return
  }

  $set('promptCode', code)
}
