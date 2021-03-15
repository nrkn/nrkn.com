(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const { createNode } = require( './src/create-node' )
const start = require( './src/game' )

const outEl = document.querySelector( 'div' )
const formEl = document.querySelector( 'form' )
const inputEl = document.querySelector( 'input' )

const inputQueue = []

formEl.onsubmit = e => {
  e.preventDefault()

  const value = inputEl.value.trim().toUpperCase()

  if( value === '' ) return

  inputQueue.push( value )
  inputEl.value = ''
}

outEl.onclick = () => inputEl.focus()

inputEl.focus()

const store = {
  load: async () => {
    const json = localStorage.getItem( 'headNode' )

    if ( json === null ) {
      const node = createNode( 'A DOG' )

      await store.save( node )

      return node
    }

    return JSON.parse( json )
  },
  save: async node => {
    const json = JSON.stringify( node )

    localStorage.setItem( 'headNode', json )
  }
}

const io = {
  say: async statement => {
    outEl.innerHTML += `${ statement.toUpperCase() }<br><br>`
  },
  confirm: async ( question = '' ) => {
    while ( true ) {
      const answer = await io.ask( question )

      if ( answer.startsWith( 'Y' ) ) return true
      if ( answer.startsWith( 'N' ) ) return false

      await io.say( `Please answer YES or NO` )
    }
  },
  ask: ( question = '' ) => new Promise(
    resolve => {
      outEl.innerHTML += `${ question.trim().toUpperCase() } > `

      const getInput = () => {
        if( inputQueue.length === 0 ){
          setTimeout( getInput, 0 )

          return
        }

        const answer = inputQueue.shift()

        outEl.innerHTML += `${ answer }<br><br>`

        resolve( answer )
      }

      getInput()
    }
  )
}

start( store, io, false ).catch( console.error )

},{"./src/create-node":2,"./src/game":3}],2:[function(require,module,exports){
const createNode = ( answer = '' ) => {
  answer = answer.trim().toUpperCase()

  const node = {
    isAnswer: true,
    yesNode: null,
    noNode: null,
    question: '',
    answer
  }

  return node
}

const addQuestion = ( node, newAnswer = '', newQuestion = '' ) => {
  newQuestion = newQuestion.trim().toUpperCase()

  if( !newQuestion.endsWith( '?' ) ) newQuestion += '?'

  node.isAnswer = false
  node.question = newQuestion
  node.noNode = createNode( node.answer )
  node.yesNode = createNode( newAnswer )
}

module.exports = { createNode, addQuestion }

},{}],3:[function(require,module,exports){
const { addQuestion } = require( './create-node' )

const start = async ( store, io, canQuit = true ) => {
  const { load, save } = store
  const { ask, confirm, say } = io

  let isPlaying = true

  while( isPlaying ){
    const head = await load()
    let current = head
    let inGame = true

    await say(
      `Think of an animal. I'll try to find it out by asking questions`
    )

    while( inGame ){
      if( current.isAnswer ){
        const isCorrectGuess = await confirm( `Is it ${ current.answer }?` )

        if( isCorrectGuess ){
          await say( `See how smart I'm getting?` )
        } else {
          const newAnswer = await ask( `I give up! What is it?` )

          const newQuestion = await ask(
            `Please type in a question whose answer is YES ` +
            `for ${ newAnswer } and NO for ${ current.answer }`
          )

          addQuestion( current, newAnswer, newQuestion )

          await say( `I'll do better next time` )
          await save( head )
        }

        inGame = false
      } else {
        const isQuestionTrue = await confirm( current.question )

        current = isQuestionTrue ? current.yesNode : current.noNode
      }
    }

    if( canQuit ){
      isPlaying = await confirm( 'Keep playing?' )
    }
  }
}

module.exports = start

},{"./create-node":2}]},{},[1]);
