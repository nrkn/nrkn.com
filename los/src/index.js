import { parseArgs } from './args.js'
import { commands } from './commands.js'
import { __ver } from './consts.js'
import { openDb } from './db.js'
import { inForm, inView } from './dom.js'
import { ensureFsRoot } from './fs.js'
import { parsePrompt, updatePromptView } from './prompt.js'

import {
  $get, initSettings, $set, $push, $len, $dec, $item, $inc
} from './settings.js'

import { updateStyleView } from './style.js'

import { wline } from './output.js'

const exec = (cmd, ...args) => {
  cmd = cmd.toLowerCase()

  if (cmd in commands) {
    commands[cmd](...args)
  } else {
    wline('Bad command or file name')
  }
}

const onInput = input => {
  input = input.trim()

  wline(parsePrompt($get('promptCode')) + input + '\n')

  if (input !== '') {
    $push('history', input)
    $set('historyIndex', $len('history'))

    const [ cmd, ...args ] = parseArgs( input )

    // just for now
    console.log( { cmd, args } )

    exec(cmd, ...args)
  }

  wline()

  updatePromptView()
}

// capture up and down arrow for command history functionality
inView.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') {
    e.preventDefault()

    if ($get('historyIndex') > 0) {
      $dec('historyIndex')
      inView.value = $item('history', $get('historyIndex'))
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()

    if ($get('historyIndex') < $get('history').length - 1) {
      $inc('historyIndex')
      inView.value = $item('history', $get('historyIndex'))
    }
  }
})

// on enter - todo: add button to submit as well
inForm.addEventListener('submit', (e) => {
  e.preventDefault()

  const input = inView.value

  inView.value = ''

  onInput(input)
})

const start = async () => {
  initSettings()
  await openDb()
  await ensureFsRoot()

  // update view to reflect settings
  updatePromptView()
  updateStyleView()

  // display version and help
  commands.ver()
  commands.copyright()
  wline('\nType HELP to see a list of commands\n')

  // so user can start typing immediately
  inView.focus()
}

start().then(() => console.log('Started ' + __ver)).catch(console.error)
