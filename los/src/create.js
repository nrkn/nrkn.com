import { button, div, h1, li, ul } from './dom.js'
import { $nextWinId } from './settings.js'
import { werr, wline } from './output.js'

export const createCommand = (type, ...args) => {
  if (type === 'window') {
    createWindowCommand(...args)

    return
  }

  werr(`Unknown create type: ${type}`)
}

export const removeCommand = (type, id) => {
  if (type === 'window') {
    removeWindowCommand(id)

    return
  }

  werr(`Unknown remove type: ${type}`)
}

export const closeCommand = removeCommand

export const minimizeCommand = (type, id) => {
  if (type === 'window') {
    const windowEl = document.getElementById(`los-window-${id}`)

    if (windowEl) {
      minimizeWindow(windowEl)
    } else {
      werr(`No window with id ${id}`)
    }

    return
  }

  werr(`Unknown minimize type: ${type}`)

}

export const restoreCommand = (type, id) => {
  if (type === 'window') {
    const windowEl = document.getElementById(`los-window-${id}`)

    if (windowEl) {
      restoreWindow(windowEl)
    } else {
      werr(`No window with id ${id}`)
    }

    return
  }

  werr(`Unknown restore type: ${type}`)
}

export const maximizeCommand = (type, id) => {
  if (type === 'window') {
    const windowEl = document.getElementById(`los-window-${id}`)

    if (windowEl) {
      maximizeWindow(windowEl)
    } else {
      werr(`No window with id ${id}`)
    }

    return
  }

  werr(`Unknown maximize type: ${type}`)
}

const windowStyle = () => ({
  position: 'absolute',
  width: '50vw',
  height: '50vh',
  top: '25vh',
  left: '25vw',
  backgroundColor: '#fff',
  border: '0.1vmin solid #39f',
  boxShadow: '0 0 1vmin 0 rgba(0,0,0,0.5)',
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
})

const titlebarStyle = () => ({
  backgroundColor: '#39f',
  color: '#fff',
  display: 'grid',
  gridTemplateColumns: '1fr auto'
})

const titleStyle = () => ({
  fontSize: '1em',
  fontWeight: 'normal',
  lineHeight: '1',
  margin: '0',
  padding: '0.25em',
  // shouldn't be selectable, interferes with dragging
  userSelect: 'none',
  // indicate to user that it's draggable
  cursor: 'move',
})

const ctrlStyle = () => ({
  margin: '0',
  padding: '0.25em',
  listStyle: 'none',
  display: 'flex',
  justifyContent: 'flex-end',
})

const btnStyle = () => ({
  fontSize: '1em',
  lineHeight: '1',
  padding: '0'
})

const minLabel = '🗕'
const maxLabel = '🗖'
const restoreLabel = '🗗'
const closeLabel = '🗙'

const updateRestoreOrMaxLabel = (windowEl, newState = 'maximize') => {
  const restoreOrMaxEl = windowEl.querySelector('.restore')

  restoreOrMaxEl.textContent = newState === 'maximize' ? maxLabel : restoreLabel
}

const createWindowTitleBar = name => {
  const titleEl = h1({ style: titleStyle() }, name)

  const minimizeEl = button({ class: 'min', style: btnStyle() }, minLabel)
  // because it's not maximised initially, we use maxLabel, will toggle to 
  // restoreLabel if maximised
  const restoreOrMaxEl = button({ class: 'restore', style: btnStyle() }, maxLabel)
  const closeEl = button({ class: 'close', style: btnStyle() }, closeLabel)

  minimizeEl.addEventListener('click', e => {
    const windowEl = e.target.closest('[data-win-id]')

    minimizeWindow(windowEl)
  })

  restoreOrMaxEl.addEventListener('click', e => {
    const windowEl = e.target.closest('[data-win-id]')

    if (windowEl.dataset.state === 'maximized') {
      restoreWindow(windowEl)
    } else {
      maximizeWindow(windowEl)
    }
  })

  closeEl.addEventListener('click', e => {
    const windowEl = e.target.closest('[data-win-id]')
    const winId = windowEl.dataset.winId

    removeWindowCommand(winId)
  })

  const ctrlEl = ul(
    { style: ctrlStyle() },
    li(minimizeEl),
    li(restoreOrMaxEl),
    li(closeEl)
  )

  // for now
  return div(
    { style: titlebarStyle() },
    titleEl,
    ctrlEl
  )
}

const createWindowContent = () => {
  // for now
  return div()
}

// just documentation for now, unused
const windowStates = ['minimized', 'maximized', 'explicit']

const createWindowCommand = name => {
  const winId = $nextWinId()

  const id = `los-window-${winId}`
  const style = windowStyle()

  const data = { winId, state: 'explicit' }

  const windowTitle = name || `Window ${winId}`

  const titleBarEl = createWindowTitleBar(windowTitle)

  const windowEl = div(
    { id, style, data },
    titleBarEl,
    createWindowContent()
  )

  document.body.append(windowEl)

  makeDraggable(windowEl, titleBarEl)

  lastExplicitSize.set(winId, windowEl.getBoundingClientRect())

  wline(`Window created with id ${winId}`)
}

const removeWindowCommand = id => {
  const windowEl = document.getElementById(`los-window-${id}`)

  if (windowEl) {
    windowEl.remove()

    wline(`Window removed with id ${id}`)
  } else {
    werr(`No window with id ${id}`)
  }
}

const lastExplicitSize = new Map()

const makeDraggable = (windowEl, titleBarEl) => {
  let isDragging = false
  let offsetX, offsetY

  titleBarEl.addEventListener('mousedown', e => {
    isDragging = true
    offsetX = e.clientX - windowEl.offsetLeft
    offsetY = e.clientY - windowEl.offsetTop
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  })

  const onMouseMove = (e) => {
    if (!isDragging) return
    windowEl.style.left = `${e.clientX - offsetX}px`
    windowEl.style.top = `${e.clientY - offsetY}px`
  };

  const onMouseUp = () => {
    isDragging = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
}

const minimizeWindow = windowEl => {
  if (windowEl.dataset.state === 'explicit') {
    lastExplicitSize.set(
      windowEl.dataset.winId, windowEl.getBoundingClientRect()
    )
  }

  windowEl.style.display = 'none'
  windowEl.dataset.state = 'minimized'

  const winId = windowEl.dataset.winId

  wline(
    `Window ${winId} minimized - type "restore window ${winId}" to restore.`
  )
}

const restoreWindow = windowEl => {
  windowEl.style.display = 'grid'
  windowEl.dataset.state = 'explicit'

  updateRestoreOrMaxLabel(windowEl, 'maximize')

  const winId = windowEl.dataset.winId
  const lastSize = lastExplicitSize.get(winId)

  if (!lastSize) {
    werr(`No size recorded for window ${winId}`)

    return
  }

  const { left, top, width, height } = lastSize

  windowEl.style.width = `${width}px`
  windowEl.style.height = `${height}px`
  windowEl.style.top = `${top}px`
  windowEl.style.left = `${left}px`
}

const maximizeWindow = windowEl => {
  if (windowEl.dataset.state === 'explicit') {
    lastExplicitSize.set(
      windowEl.dataset.winId, windowEl.getBoundingClientRect()
    )
  }

  windowEl.style.display = 'grid'
  windowEl.dataset.state = 'maximized'
  windowEl.style.width = '100vw'
  windowEl.style.height = '100vh'
  windowEl.style.top = '0'
  windowEl.style.left = '0'

  updateRestoreOrMaxLabel(windowEl, 'restore')
}
