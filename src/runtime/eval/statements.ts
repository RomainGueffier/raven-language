import {
  FunctionDeclaration,
  Program,
  VarDeclaration,
} from '../../syntax/ast.js'
import Environment from '../environment.js'
import { evaluate } from '../interpreter.js'
import { FunctionValue, makeNull, RuntimeValue } from '../values.js'

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

export function evalFunctionDeclaration(
  declaration: FunctionDeclaration,
  env: Environment
): RuntimeValue {
  // create a new function scope
  const fn: FunctionValue = {
    type: 'function',
    name: declaration.name,
    parameters: declaration.parameters,
    declarationEnv: env,
    body: declaration.body,
  }

  return env.declareVariable(declaration.name, fn, true)
}

export function evalProgram(program: Program, env: Environment): RuntimeValue {
  let lastEvaluated: RuntimeValue = makeNull()

  program.body.forEach((statement) => {
    lastEvaluated = evaluate(statement, env)
  })

  return lastEvaluated
}
