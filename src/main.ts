import util from 'node:util'
import Parser from './syntax/parser'
import Environment from './runtime/environment'
import { evaluate } from './runtime/interpreter'
import { makeBoolean, makeNull, makeNumber } from './runtime/values'

export default function main(sourceCode: string) {
  const parser = new Parser()
  const program = parser.produceAST(sourceCode)

  const env = new Environment()

  // Create Default Global Enviornment
  env.declareVariable('x', makeNumber(100))
  env.declareVariable('true', makeBoolean(true))
  env.declareVariable('false', makeBoolean(false))
  env.declareVariable('null', makeNull())

  const result = evaluate(program, env)
  console.log(
    util.inspect(result, { showHidden: false, depth: null, colors: true })
  )
}
