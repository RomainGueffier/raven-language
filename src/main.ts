import util from 'node:util'
import Parser from './syntax/parser.js'
import { createGlobalEnvironment } from './runtime/environment.js'
import { evaluate } from './runtime/interpreter.js'

const env = createGlobalEnvironment()
const parser = new Parser()

export default function main(sourceCode: string) {
  try {
    const program = parser.produceAST(sourceCode)
    evaluate(program, env)
  } catch (error) {
    console.error(
      util.inspect(error, { showHidden: false, depth: null, colors: true })
    )
  }
}
