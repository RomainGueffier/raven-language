import util from 'node:util'
import Parser from './syntax/parser'
import Environment from './runtime/environment'
import { evaluate } from './runtime/interpreter'

const env = new Environment()
const parser = new Parser()

export default function main(sourceCode: string) {
  try {
    const program = parser.produceAST(sourceCode)
    const result = evaluate(program, env)
    console.log(
      util.inspect(result, { showHidden: false, depth: null, colors: true })
    )
  } catch (error) {
    console.error(error)
  }
}
