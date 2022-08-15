import { alignListCenter } from './draw.js'
import { alignListRight } from './draw.js'
import { alignListBottom } from './draw.js'
import { align } from './draw.js'
import { drawList } from './draw.js'
import { textDrawList } from './font.js'
import { loadFont } from './font.js'
import { createRenderer } from './render.js'

const start = async () => {
  const font = await loadFont('data/font.png')
  const fontLrg = await loadFont('data/font-large.png')
  const icons = await loadFont('data/icons.png')

  let bat = 4
  let bars = 4
  const chance = 1000

  const onRender = bitmap => {
    if (Math.floor(Math.random() * chance) === 0) {
      bat = Math.floor(Math.random() * 4) + 1
    }
    if (Math.floor(Math.random() * chance) === 0) {
      bars = Math.floor(Math.random() * 4) + 1
    }

    bitmap.data.fill(0)

    const nokiaList = align(
      textDrawList( font, '2degrees' ),
      { right: bitmap.width, bottom: bitmap.height - 1 },
      'center'
    )

    drawList(bitmap, nokiaList, 0, 8 )

    const menuList = align(
      textDrawList(font, 'Menu'),
      { right: bitmap.width, bottom: bitmap.height - 1 },
      'center', 'bottom'
    )

    drawList(bitmap, menuList)

    const now = new Date()
    const timeString = `${now.getHours().toString(10).padStart(2, '0')}:${now.getMinutes().toString(10).padStart(2, '0')}`
    
    const timeList = align(
      textDrawList(font, timeString),
      { right: bitmap.width - 8 },
      'right'
    )
    drawList(bitmap, timeList)

    const barsString = '!'
    const barsList = align(
      textDrawList(icons, barsString),
      { bottom: bitmap.height - 10 },
      'bottom'
    )
    drawList(bitmap, barsList)

    const batString = '"'
    const batList = align(
      textDrawList(icons, batString),
      { right:  bitmap.width, bottom: bitmap.height - 10 },
      'right', 'bottom'      
    )
    drawList(bitmap, batList)

    const barsStrings = '#$%&'.split('')
    let y = 17

    for (let i = 0; i < bars; i++) {
      const bString = barsStrings[i]
      const barList = align(
        textDrawList(icons, bString),
        { bottom: bitmap.height - y },
        'bottom'
      )
      drawList(bitmap, barList)

      y += 8
    }

    y = 17
    for (let i = 0; i < bat; i++) {
      const bString = barsStrings[i]

      const barList = align(
        textDrawList(icons, bString),
        { right: bitmap.width, bottom: bitmap.height - y },
        'right', 'bottom'
      )

      drawList(bitmap, barList)

      y += 8
    }
  }

  const renderer = createRenderer(onRender)

  await renderer.start()
}

start().catch(e => alert(e.message || 'Unknown error'))
