import { wline } from './output.js'

export const exprCommand = expr => {
  // later, we will use esprima to parse the expression, validate it via a 
  // whitelist of allowed AST nodes, and then evaluate it in a scope that has eg 
  // environment variables, but for now we will just be cheap and use eval

  try {
    const result = eval( expr )

    wline( JSON.stringify( result, null, 2 ) )
  } catch( err ){
    wline( err.message )
    console.error( err )
  }
}
