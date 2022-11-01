import util from 'node:util'
import Parser from './syntax/parser'
import { createGlobalEnvironment } from './runtime/environment'
import { evaluate } from './runtime/interpreter'

const env = createGlobalEnvironment()
const parser = new Parser()

export default function main(sourceCode: string) {
  try {
    const program = parser.produceAST(sourceCode)
    const result = evaluate(program, env)
    console.log(
      util.inspect(result, { showHidden: false, depth: null, colors: true })
    )
  } catch (error) {
    console.error(
      util.inspect(error, { showHidden: false, depth: null, colors: true })
    )
  }
}
