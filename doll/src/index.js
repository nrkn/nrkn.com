import { getHsl } from './color.js'
import { loadSvg, ass, loadImg, randomHsl, randInt, chance, reverseDom, pick, pickIndex } from './util.js'

const baseLayers = ['Eyes', 'Head', 'Body']
const rootLayers = ['Accessories', 'HairFront', ...baseLayers, 'HairBackBase', 'HairBack']

const accessoryLayers = ['Freckles', 'Sunglasses', 'Glasses', 'Bowtie', 'Cap', 'Headscarf']

const logConsole = false
const addShadows = true
const bigFirst = false

const log = logConsole ? console.log : () => {}

const getAccColor = () => {
  const c = randomHsl()

  // monochrome
  if (chance(0.4)) c[1] = 0

  return c
}

const editDoll = (svgEl, skinImg, hairImg, eyesImg ) => {
  const layers = new Map()
  const skinColors = getHsl(skinImg)
  const hairColors = getHsl(hairImg)
  const eyeColors = getHsl(eyesImg)

  log({ skinColors, hairColors, eyeColors })

  for (const rootLayerName of rootLayers) {
    layers.set(rootLayerName, ass(svgEl.getElementById(rootLayerName)), 'getting root layer')
  }

  const hideChildren = name => {
    const layer = layers.get(name)

    for (const element of layer.children) {
      element.style.display = 'none'
      element.classList.remove('selected')
    }
  }

  const hide = name => {
    const selectedEl = ass(svgEl.getElementById(name),`hide ${ name }`)

    selectedEl.style.display = 'none'
    selectedEl.classList.remove('selected')
  }

  const show = name => {
    const selectedEl = ass(svgEl.getElementById(name),`show ${ name }`)

    selectedEl.style.display = 'initial'
    selectedEl.classList.add('selected')
  }

  const reset = () => {
    for (const rootLayerName of rootLayers) {
      if (baseLayers.includes(rootLayerName)) continue

      hideChildren(rootLayerName)
    }

    const fillTargets = svgEl.querySelectorAll('[fill]')

    if( !addShadows ) return

    for (const el of fillTargets) {
      let color = 'rgba(0, 0, 0, 0.5)'
      if( el.closest( '#Eyes' ) ){
        color = 'rgba(255, 255, 255, 0.5)'
      }
      el.style.filter = `drop-shadow(0px 0px 2px ${ color })`
    }
  }

  const findColorTargets = name => {
    const el = ass(svgEl.getElementById(name),`findColorTargets ${ name }`)

    if (el.matches('[fill]')) {
      log(name, 'matched named el')
      return [el]
    }

    return Array.from(el.querySelectorAll('[fill]'))
  }

  const setHsl = (name, hsl) => {
    const els = findColorTargets(name)

    for (const el of els)
      el.setAttribute('fill', `hsl(${hsl[0]},${hsl[1]}%,${hsl[2]}%)`)
  }

  const random = () => {
    reset()

    let isAfro = false

    for (const rootLayerName of rootLayers) {
      if (baseLayers.includes(rootLayerName)) continue
      if (rootLayerName === 'Accessories') continue

      const layer = layers.get(rootLayerName)
      const elements = [...layer.children]
      const selectedEl = pick( elements )

      selectedEl.style.display = 'initial'
      selectedEl.classList.add('selected')

      isAfro = rootLayerName === 'HairBack' && selectedEl.id === 'Afro'
    }

    const capGroup = ass(svgEl.getElementById('Cap'), 'finding cap group #Cap')
    const cap = ass( capGroup.querySelector('[fill]'), '#Cap [fill]' )

    if( isAfro ){
      cap.setAttribute('transform', `translate(-10 -100)`)
    } else {
      cap.setAttribute('transform', `translate(0 0)`)
    }

    log({ isAfro })

    // --

    const skinColorIndex = pickIndex( skinColors )
    const skinColor = skinColors[ skinColorIndex ]

    setHsl('Head', skinColor)

    log({ skinColor })

    // --

    const hairFrontColorIndex = pickIndex( hairColors )

    const hairBackColorIndex = (
      hairFrontColorIndex === 0 ?
        1 :
        hairFrontColorIndex === hairColors.length - 1 ?
          hairColors.length - 2 :
          chance(0.5) ?
            hairFrontColorIndex - 1 :
            hairFrontColorIndex + 1
    )

    const hairFrontColor = hairColors[hairFrontColorIndex]
    const hairBackColor = chance(0.125) ? hairColors[hairBackColorIndex] : hairFrontColor

    setHsl('HairBack', hairBackColor)
    setHsl('HairBackBase', hairFrontColor)
    setHsl('HairFront', hairFrontColor)

    log({ hairFrontColor, hairBackColor })

    // special
    if (chance(0.4) && !isAfro ) {
      hideChildren('HairBack')
    }
    if (chance(0.125)) {
      hideChildren('HairFront')
      hideChildren('HairBackBase')
    }

    // --
    // special - random hair

    if (chance(0.25)) {
      const hairFrontColor = randomHsl()
      const hairBackColor = chance(0.125) ? randomHsl() : hairFrontColor

      setHsl('HairFront', hairFrontColor)
      setHsl('HairBackBase', hairFrontColor)
      setHsl('HairBack', hairBackColor)

      log({ hairFrontColor, hairBackColor })
    }

    // --------

    
    if (chance(0.125)) {
      setHsl('Sunglasses', getAccColor())
      show('Sunglasses')
      log('Sunglasses')
    } else if (chance(0.125)) {
      setHsl('Glasses', getAccColor())
      show('Glasses')
      log('Glasses')
    }

    if (chance(0.125)) {
      show('Freckles')
      log('Freckles')

      // special - freckles should be any color but skin
      let freckleColorIndex = pickIndex( skinColors )
      while (freckleColorIndex === skinColorIndex) freckleColorIndex = pickIndex( skinColors )
      const freckleColor = skinColors[freckleColorIndex]
      setHsl('Freckles', freckleColor)
      log({ freckleColor })
    }

    if (chance(0.125)) {
      setHsl('Bowtie', getAccColor())
      show('Bowtie')
      log('Bowtie')
    }

    if (chance(0.125)) {
      const headscarfColor = getAccColor()
      setHsl('Headscarf', headscarfColor)
      show('Headscarf')

      setHsl('HairBackBase', headscarfColor)
      hide('HairBack')
      show('HairBackBase')

      log('Headscarf')
    } else if (chance(0.125)) {
      setHsl('Cap', getAccColor())
      show('Cap')
      log('Cap')
    }

    // --

    // special - 1:4 random skin color/freckles
    if (chance(0.25)) {
      const weirdSkinColor = randomHsl()

      // don't go darker than 15
      weirdSkinColor[2] = randInt(70) + 15

      const freckleColor = weirdSkinColor.slice()

      // invert hue
      freckleColor[0] = 360 - weirdSkinColor[0]
      // invert lightness
      freckleColor[2] = 100 - weirdSkinColor[2]

      setHsl('Head', weirdSkinColor)
      setHsl('Freckles', freckleColor)

      log({ weirdSkinColor, freckleColor })
    }

    // --

    const bodyColor = getAccColor()

    setHsl('Body', bodyColor)

    log({ bodyColor })

    // --

    let eyeColor = pick( eyeColors )

    if( chance( 0.25 ) ){
      eyeColor = randomHsl()
      // sat
      eyeColor[1] = 100
    } 

    // light
    eyeColor[2] = 30

    setHsl('Eyes', eyeColor)

    log({ eyeColor })

    // --

    const sunglassTargets = findColorTargets('Sunglasses')

    for (const el of sunglassTargets) {
      el.style.opacity = '0.9'
    }
  }

  return { reset, random }
}

const start = async () => {
  const svgEl = await loadSvg('data/doll.svg')
  const skinImg = await loadImg('data/skin.png')
  const hairImg = await loadImg('data/hair.png')
  const eyesImg = await loadImg('data/eyes.png')


  for (let i = 0; i < 104; i++) {
    const el = svgEl.cloneNode(true)

    if( bigFirst ) el.classList.toggle('first', i <= 1 )

    document.body.append(el)

    const editor = editDoll(el, skinImg, hairImg, eyesImg )

    editor.random()

    // --

    const tiltLeftView = el.cloneNode(true)

    tiltLeftView.classList.add( 'tiltLeft' )
    

    const tiltLeftBox = document.createElement( 'div' )
    tiltLeftBox.classList.add( 'tiltBox' )
    if( bigFirst ) tiltLeftBox.classList.toggle('tiltFirst', i <= 1 )
    tiltLeftBox.append( tiltLeftView )
    el.before( tiltLeftBox )

    // --
    const tiltRightView = el.cloneNode(true)

    tiltRightView.classList.add( 'tiltRight' )
    

    const tiltRightBox = document.createElement( 'div' )
    tiltRightBox.classList.add( 'tiltBox' )
    if( bigFirst ) tiltRightBox.classList.toggle('tiltFirst', i <= 1 )
    tiltRightBox.append( tiltRightView )
    el.after( tiltRightBox )

    // --

    const backView = reverseDom(el.cloneNode(true))

    backView.setAttribute('transform', `scale(-1 1)`)

    // --

    // fixes
    /*
      Cap
      Headscarf
    */

    const ids = [ ...backView.querySelectorAll('[id]') ].map( e => e.id )

    const hatEl = ass(backView.querySelector('#Cap'),'back view #Cap ' + ids.join( ',') )

    // move to top    
    backView.append(hatEl)
    
    const headscarfEl = ass(backView.querySelector('#Headscarf'),'#Headscarf')
    const headEl = ass(backView.querySelector('#Head'),'#Head')

    headEl.after( headscarfEl )

    document.body.append(backView)
  }
}

start().catch( err => alert( err ))
