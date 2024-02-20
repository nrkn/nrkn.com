import { bgCommand, fgCommand } from './color.js'
import { __ver } from './consts.js'
import { closeCommand, createCommand, maximizeCommand, minimizeCommand, removeCommand, restoreCommand } from './create.js'
import { dbGet, dbSet } from './db.js'
import { outView } from './dom.js'
import { exprCommand } from './expr.js'
import { fontsizeCommand } from './font.js'

import { 
  cdCommand, downloadCommand, freeCommand, lsCommand, mimeTypeCommand, 
  mkdirCommand, uploadCommand, viewCommand 
} from './fs-commands.js'

import { debugHelp, helpCommand } from './help.js'
import { promptCommand } from './prompt.js'
import { timeCommand } from './time.js'
import { wline } from './output.js'

export const commands = {
  prompt: promptCommand,
  ver: () => wline(__ver),
  time: timeCommand,
  clear: () => {
    outView.innerHTML = ''
  },
  cls: () => commands.clear(),
  help: helpCommand,
  fg: fgCommand,
  bg: bgCommand,
  fontsize: fontsizeCommand,

  //special
  copyright: () =>
    wline(
      `(c) Litwood Industrial Tech. All rights reserved.`
    ),

  //fs

  ls: lsCommand,
  dir: ( ...args ) => commands.ls( ...args ),
  cd: cdCommand,
  mkdir: mkdirCommand,

  upload: uploadCommand,
  view: viewCommand,
  download: downloadCommand,
  mime: mimeTypeCommand,
  free: freeCommand,

  // experimental

  expr: exprCommand,
  create: createCommand,
  remove: removeCommand,
  close: closeCommand,
  minimize: minimizeCommand,
  restore: restoreCommand,
  maximize: maximizeCommand,

  //
  debug: ( cmd = 'text', arg0, arg1 ) => {
    // does 80x25 approximately fit at the right aspect ratio? We use viewport
    // relative units for font size, so it should, except when the aspect ratio
    // is very landscape (less rows) or very portrait (more rows)
    if( cmd === 'text' ){
      for (let y = 0; y < 25; y++) {
        const str = '0123456789'.repeat(8)
        wline(str)
      }
      
      return
    }

    if( cmd === 'dbget' ){
      dbGet(arg0).then( val => {
        wline( typeof val + ' ' + JSON.stringify(val))
      })

      return
    }

    if( cmd === 'dbset'){
      dbSet(arg0, arg1).then( () => {
        wline('OK')
      })

      return
    }
  }
}

// execute debugHelp once to ensure all commands have a matching help entry
//
// missing commands will be logged to console
debugHelp(commands)
