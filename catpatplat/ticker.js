let ticking = false

export const startTicker = onTick => {
  ticking = true

  let lastTime

  const tick = time => {
    if( !ticking ) return
    
    if( !lastTime ){
      lastTime = time

      onTick( 0, time )
      requestAnimationFrame( tick )
      
      return
    }

    const elapsed = time - lastTime
    lastTime = time

    onTick( elapsed, time )    
    requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}

export const stopTicker = () => {
  ticking = false
}
