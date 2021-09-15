document.addEventListener( 'DOMContentLoaded', e => {
  'use strict'

  const throttle = ( type, name, obj ) => {
    obj = obj || window
    let isRunning = false

    const fn = () => {
      if( isRunning ) return

      isRunning = true

      requestAnimationFrame( () => {
        obj.dispatchEvent( new CustomEvent( name ) )
        isRunning = false
      } )
    }

    obj.addEventListener( type, fn )
  }

  throttle( 'resize', 'optimizedResize' )

  const viewport = document.querySelector( '.viewport' )
  const canvas = document.querySelector( '.canvas' )

  const dragHandlerSymbol = Symbol( 'dragHandler' )
  const handlesSymbol = Symbol( 'handles' )
  const handleParentSymbol = Symbol( 'handleParent' )
  const containmentSymbol = Symbol( 'containment' )

  // requires a positioned parent
  const innerSize = el => {
    const rect = el.getBoundingClientRect()
    const style = getComputedStyle( el )

    let { width, height } = rect

    width -= parseFloat( style.paddingLeft )
    width -= parseFloat( style.paddingRight )
    height -= parseFloat( style.paddingTop )
    height -= parseFloat( style.paddingBottom )

    return { width, height }
  }

  const Scale = ( parentRect, childRect ) =>
    Math.min(
      parentRect.width / childRect.width,
      parentRect.height / childRect.height
    )

  const scalePosition = ( position, scale ) => {
    let { top, left } = position

    top *= scale
    left *= scale

    return { top, left }
  }

  const unitScalePosition = ( position, scale ) => {
    let { top, left } = position

    top /= scale
    left /= scale

    return { top, left }
  }

  const scaleRect = ( rect, scale ) => {
    let { top, left, width, height } = rect

    top *= scale
    left *= scale
    width *= scale
    height *= scale

    return { top, left, width, height }
  }

  const unitScaleRect = ( rect, scale ) => {
    let { top, left, width, height } = rect

    top /= scale
    left /= scale
    width /= scale
    height /= scale

    return { top, left, width, height }
  }

  const positionEl = ( el, rect ) => {
    const { top, left, width, height } = rect

    el.style.position = 'absolute'
    el.style.top = top + 'px'
    el.style.left = left + 'px'

    if( width !== undefined && height !== undefined ){
      el.style.width = width + 'px'
      el.style.height = height + 'px'
    }
  }

  const elPosition = el => {
    let { top, left } = el.dataset

    top = parseFloat( top )
    left = parseFloat( left )

    return { top, left }
  }

  const elRect = el => {
    let { top, left, width, height } = el.dataset

    top = parseFloat( top )
    left = parseFloat( left )
    width = parseFloat( width )
    height = parseFloat( height )

    return { top, left, width, height }
  }

  const elStyleRect = el => {
    let { top, left, width, height } = el.style

    top = parseFloat( top )
    left = parseFloat( left )
    width = parseFloat( width )
    height = parseFloat( height )

    return { top, left, width, height }
  }

  const elStylePosition = el => {
    let { top, left } = el.style

    top = parseFloat( top )
    left = parseFloat( left )

    return { top, left }
  }

  const EditorDocument = ( el, unitSize ) => {
    const parentContainer = el.parentNode
    const children = []

    const deactivateHandles = child => {
      const { n, e, s, w } = child[ handlesSymbol ]

      n.classList.remove( 'active' )
      e.classList.remove( 'active' )
      s.classList.remove( 'active' )
      w.classList.remove( 'active' )
    }

    const activateHandles = child => {
      const { n, e, s, w } = child[ handlesSymbol ]

      n.classList.add( 'active' )
      e.classList.add( 'active' )
      s.classList.add( 'active' )
      w.classList.add( 'active' )
    }

    const deselect = child => {
      child.classList.remove( 'selected' )

      deactivateHandles( child )
    }

    const select = child => {
      child.classList.add( 'selected' )
      activateHandles( child )
    }

    const deselectAll = () => children.forEach( deselect )

    const toggle = el => {
      const child = el.closest( '.document-child' )
      const isSelected = child !== null && child.matches( '.selected' )

      deselectAll()

      if( child !== null && !isSelected ){
        select( child )
      }
    }

    parentContainer.addEventListener( 'click', e => {
      toggle( e.target )
    })

    const fitToParent = () => {
      const parentInnerSize = innerSize( parentContainer )
      const scale = Scale( parentInnerSize, unitSize )

      const width = unitSize.width * scale
      const height = unitSize.height * scale

      el.style.width = width + 'px'
      el.style.height = height + 'px'

      editorDocument.scale = scale

      children.forEach( child => {
        positionEl( child, scaleRect( elRect( child ), editorDocument.scale ) )
        positionHandles( child )
      })
    }

    const positionHandles = ( child, includeHandles = [ 'n', 'e', 's', 'w' ] ) => {
      const rect = elRect( child )

      const { n, e, s, w } = child[ handlesSymbol ]

      if( includeHandles.includes( 'n' ) ){
        const nPosition = {
          left: rect.left + rect.width / 2,
          top: rect.top
        }

        Object.assign( n.dataset, nPosition )
        positionEl( n, scalePosition( nPosition, editorDocument.scale ) )
      }

      if( includeHandles.includes( 'e' ) ){
        const ePosition = {
          left: rect.left + rect.width,
          top: rect.top + rect.height / 2
        }

        Object.assign( e.dataset, ePosition )
        positionEl( e, scalePosition( ePosition, editorDocument.scale ) )
      }

      if( includeHandles.includes( 's' ) ){
        const sPosition = {
          left: rect.left + rect.width / 2,
          top: rect.top + rect.height
        }

        Object.assign( s.dataset, sPosition )
        positionEl( s, scalePosition( sPosition, editorDocument.scale ) )
      }

      if( includeHandles.includes( 'w' ) ){
        const wPosition = {
          left: rect.left,
          top: rect.top + rect.height / 2
        }

        Object.assign( w.dataset, wPosition )

        positionEl( w, scalePosition( wPosition, editorDocument.scale ) )
      }
    }

    const addHandles = child => {
      const rect = elRect( child )
      const n = document.createElement( 'div' )
      const e = document.createElement( 'div' )
      const s = document.createElement( 'div' )
      const w = document.createElement( 'div' )

      n.classList.add( 'handle', 'n' )
      e.classList.add( 'handle', 'e' )
      s.classList.add( 'handle', 's' )
      w.classList.add( 'handle', 'w' )

      child[ handlesSymbol ] = { n, e, s, w }
      n[ handleParentSymbol ] = child
      e[ handleParentSymbol ] = child
      s[ handleParentSymbol ] = child
      w[ handleParentSymbol ] = child

      el.appendChild( n )
      el.appendChild( e )
      el.appendChild( s )
      el.appendChild( w )

      positionHandles( child )

      const nHandler = new Draggabilly( n, { axis: 'y' } )
      const eHandler = new Draggabilly( e, { axis: 'x' } )
      const sHandler = new Draggabilly( s, { axis: 'y' } )
      const wHandler = new Draggabilly( w, { axis: 'x' } )

      const dragEnd = () =>
        setTimeout( () => {
          positionHandles( child )
          select( child )
        }, 16 )

      nHandler.on( 'dragStart', () => {
        const childStyleRect = elStyleRect( child )
        const { top: childTop, height: childHeight } = childStyleRect

        Object.assign( n.dataset, { childTop, childHeight })
      })

      nHandler.on( 'dragMove', ( event, pointer, moveVector ) => {
        const { y } = moveVector
        const heightAmount = y * -1

        let { childTop, childHeight } = n.dataset

        childTop = parseFloat( childTop ) + y
        childHeight = parseFloat( childHeight ) + heightAmount

        if( childHeight < 0 ){
          childHeight = Math.abs( childHeight )
          childTop = childTop - childHeight
        }

        child.style.top = childTop + 'px'
        child.style.height = childHeight + 'px'

        updateChildRect( child )
        positionHandles( child, [ 'e', 'w' ] )
      })

      nHandler.on( 'dragEnd', dragEnd )

      eHandler.on( 'dragStart', () => {
        const childStyleRect = elStyleRect( child )
        const { left: childLeft, width: childWidth } = childStyleRect

        Object.assign( e.dataset, { childLeft, childWidth } )
      })

      eHandler.on( 'dragMove', ( event, pointer, moveVector ) => {
        const { x } = moveVector

        let { childLeft, childWidth } = e.dataset

        childLeft = parseFloat( childLeft )
        childWidth = parseFloat( childWidth ) + x

        if( childWidth < 0 ){
          childWidth = Math.abs( childWidth )
          childLeft = childLeft - childWidth
        }

        child.style.left = childLeft + 'px'
        child.style.width = childWidth + 'px'

        updateChildRect( child )
        positionHandles( child, [ 'n', 's' ] )
      })

      eHandler.on( 'dragEnd', dragEnd )

      sHandler.on( 'dragStart', () => {
        const childStyleRect = elStyleRect( child )
        const { top: childTop, height: childHeight } = childStyleRect

        Object.assign( s.dataset, { childTop, childHeight })
      })

      sHandler.on( 'dragMove', ( event, pointer, moveVector ) => {
        const { y } = moveVector

        let { childTop, childHeight } = s.dataset

        childTop = parseFloat( childTop )
        childHeight = parseFloat( childHeight ) + y

        if( childHeight < 0 ){
          childHeight = Math.abs( childHeight )
          childTop = childTop - childHeight
        }

        child.style.top = childTop + 'px'
        child.style.height = childHeight + 'px'

        updateChildRect( child )
        positionHandles( child, [ 'e', 'w' ] )
      })

      sHandler.on( 'dragEnd', dragEnd )

      wHandler.on( 'dragStart', () => {
        const childStyleRect = elStyleRect( child )
        const { left: childLeft, width: childWidth } = childStyleRect

        Object.assign( w.dataset, { childLeft, childWidth })
      })

      wHandler.on( 'dragMove', ( event, pointer, moveVector ) => {
        const { x } = moveVector
        const widthAmount = x * -1

        let { childLeft, childWidth } = w.dataset

        childLeft = parseFloat( childLeft ) + x
        childWidth = parseFloat( childWidth ) + widthAmount

        if( childWidth < 0 ){
          childWidth = Math.abs( childWidth )
          childLeft = childLeft - childWidth
        }

        child.style.left = childLeft + 'px'
        child.style.width = childWidth + 'px'

        updateChildRect( child )
        positionHandles( child, [ 'n', 's' ] )
      })

      wHandler.on( 'dragEnd', dragEnd )
    }

    const addChild = rect => {
      const child = document.createElement( 'div' )

      child.classList.add( 'document-child' )

      Object.assign( child.dataset, rect )

      positionEl( child, scaleRect( rect, editorDocument.scale ) )

      el.appendChild( child )

      children.push( child )

      const handler = new Draggabilly( child )

      child[ dragHandlerSymbol ] = handler

      handler.on( 'dragStart', () => {
        deselectAll()
        select( child )
        deactivateHandles( child )
      })

      handler.on( 'dragEnd', () => {
        updateChildRect( child )
        positionHandles( child )
        deselect( child )
      })

      addHandles( child )

      return child
    }

    const updateChildRect = child => {
      const styleRect = elStyleRect( child )
      const unitRect = unitScaleRect( styleRect, editorDocument.scale )

      Object.assign( child.dataset, unitRect )
    }

    const childNodes = () => children.slice()

    const editorDocument = {
      el, unitSize, fitToParent, childNodes, addChild
    }

    fitToParent()

    return editorDocument
  }

  const unitSize = {
    width: 595.275591,
    height: 841.889764
  }

  const editorDocument = EditorDocument( canvas, unitSize )

  const special = editorDocument.addChild({
    left: 31.620028,
    top: 25.511810,
    width: 556.838684,
    height: 133.177979
  })

  const detail = editorDocument.addChild({
    left: 70.533073,
    top: 172.784927,
    width: 504.856567,
    height: 70.299210
  })

  window.addEventListener( 'optimizedResize', e => {
    editorDocument.fitToParent()
  })
})