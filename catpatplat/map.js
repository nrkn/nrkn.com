import { createSequence } from './lib/array.js'
import { pointsToPathString } from './lib/dom.js'
import { s } from './lib/dom.js'
import { translate } from './lib/geo.js'
import { randClt } from './lib/random.js'

export const randPolyline = (width, height, segmentCount = 32) => {
  const segmentLength = width / (segmentCount - 1)
  const segmentLengthHalf = segmentLength / 2
  const min = -(segmentLength / 4)

  const polyline = createSequence(segmentCount, i => {
    let x = i * segmentLength

    if (i > 0 && i < segmentCount - 1) {
      x += randClt() * segmentLengthHalf + min
    }

    let y = randClt(16) * height

    x |= 0
    y |= 0

    return { x, y }
  })

  return polyline
}

export const lineToPath = (width, polyline) => {
  const yOff = width / 2

  const top = polyline.map(p => translate(p, { y: -yOff }))
  const bottom = polyline.map(p => translate(p, { y: yOff })).reverse()

  return [...top, ...bottom, top[0]]
}

export const createSvg = (width, height, playerRadius, polyline) => {
  const viewBox = [0, 0, width, height]
  const svgEl = s('svg', { width, height, viewBox })

  const points = polyline.map(p => [p.x, p.y].join(',')).join(' ')

  const polylineEl = s('polyline', { points, fill: 'none', stroke: 'none' })

  svgEl.append(polylineEl)

  {
    const yOff = playerRadius * 2
    const top = polyline.map(p => translate(p, { y: -yOff }))
    const groundPoints = [...top, { x: width, y: height }, { x: 0, y: height }, polyline[0]]

    const d = groundPoints.map((p, i) => {
      const { x, y } = p

      if (i === 0) return `M ${x},${y} `

      return `L ${x},${y}`
    })

    const groundEl = s('path', { d, stroke: 'none', fill: '#2e8' })

    svgEl.append(groundEl)
  }

  {
    const yOff = playerRadius * 4
    const top = polyline.map(p => translate(p, { y: yOff }))
    const kerbPoints = [...top, { x: width, y: height }, { x: 0, y: height }, polyline[0]]

    const d = kerbPoints.map((p, i) => {
      const { x, y } = p

      if (i === 0) return `M ${x},${y} `

      return `L ${x},${y}`
    })

    const kerbEl = s('path', { d, stroke: 'none', fill: '#aaa' })

    svgEl.append(kerbEl)
  }

  {
    const yOff = playerRadius * 4.5
    const top = polyline.map(p => translate(p, { y: yOff }))
    const roadPoints = [...top, { x: width, y: height }, { x: 0, y: height }, polyline[0]]

    const d = roadPoints.map((p, i) => {
      const { x, y } = p

      if (i === 0) return `M ${x},${y} `

      return `L ${x},${y}`
    })

    const roadEl = s('path', { d, stroke: 'none', fill: '#888' })

    svgEl.append(roadEl)
  }

  {
    const pathPoints = lineToPath(playerRadius * 2, polyline)
    const d = pointsToPathString(pathPoints)

    const pathEl = s('path', { d, stroke: 'none', fill: '#aaa' })

    svgEl.append(pathEl)
  }

  {
    const gridStep = width / 10

    const gridPoints = createSequence(11, i => {
      const x = i * gridStep
      const y = height / 2

      return { x, y }
    })

    for (let i = 0; i < gridPoints.length; i++) {
      const p = gridPoints[i]
      const circleEl = s('circle', { cx: p.x, cy: p.y, r: 15, fill: '#fff', stroke: 'none' })
      const textEl = s('text', { x: p.x - 5, y: p.y + 5, fill: '#000', stroke: 'none' }, String(i))
      const lineEl = s('line', { x1: p.x, y1: 0, x2: p.x, y2: height, fill: 'none', stroke: '#2e8', 'stroke-width': 5 })

      svgEl.append(lineEl, circleEl, textEl)
    }
  }

  const playerEl = s('circle', { cx: 0, cy: 0, r: playerRadius, stroke: 'none', fill: '#666' })

  svgEl.append(playerEl)

  return { svgEl, polylineEl, playerEl }
}

export const createBackgroundSvg = (width, height, fill, polyline) => {
  const viewBox = [0, 0, width, height]
  const backgroundSvgEl = s('svg', { width, height, viewBox })

  const points = polyline.map(p => [p.x, p.y].join(',')).join(' ')

  const polylineEl = s('polyline', { points, fill: 'none', stroke: 'none' })

  backgroundSvgEl.append(polylineEl)

  {
    const groundPoints = [...polyline, { x: width, y: height }, { x: 0, y: height }, polyline[0]]

    const d = groundPoints.map((p, i) => {
      const { x, y } = p

      if (i === 0) return `M ${x},${y} `

      return `L ${x},${y}`
    })

    const groundEl = s('path', { d, stroke: 'none', fill })

    backgroundSvgEl.append(groundEl)
  }

  {
    const gridStep = width / 10

    const gridPoints = createSequence(11, i => {
      const x = i * gridStep
      const y = height / 2

      return { x, y }
    })

    for (let i = 0; i < gridPoints.length; i++) {
      const p = gridPoints[i]
      const lineEl = s('line', { x1: p.x, y1: 0, x2: p.x, y2: height, fill: 'none', stroke: fill, 'stroke-width': 5 })
      const circleEl = s('circle', { cx: p.x, cy: p.y, r: 15, fill: '#fff', stroke: 'none' })
      const textEl = s('text', { x: p.x - 5, y: p.y + 5, fill: '#000', stroke: 'none' }, String(i))

      backgroundSvgEl.append(lineEl, circleEl, textEl)
    }
  }

  return { backgroundSvgEl, polylineEl }
}