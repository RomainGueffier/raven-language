import { Program, VarDeclaration } from '../../syntax/ast.js'
import Environment from '../environment.js'
import { evaluate } from '../interpreter.js'
import { makeNull, RuntimeValue } from '../values.js'

export function evalVarDeclaration(
  declaration: VarDeclaration,
  env: Environment
): RuntimeValue {
  const value = declaration?.value
    ? evaluate(declaration.value, env)
    : makeNull()
  return env.declareVariable(
    declaration.identifier,
    value,
    declaration.constant
  )
}

export function evalProgram(program: Program, env: Environment): RuntimeValue {
  let lastEvaluated: RuntimeValue = makeNull()

  program.body.forEach((statement) => {
    lastEvaluated = evaluate(statement, env)
  })

  return lastEvaluated
}
