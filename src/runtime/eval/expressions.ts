import {
  AssignmentExpression,
  BinaryExpression,
  Identifier,
  ObjectLiteral,
} from '../../syntax/ast.js'
import Environment from '../environment.js'
import { evaluate } from '../interpreter.js'
import { makeNull, NumberValue, ObjectValue, RuntimeValue } from '../values.js'

export function evalNumericBinaryExpression(
  left: number,
  right: number,
  operator: string
): NumberValue {
  let result: NumberValue = { value: 0, type: 'number' }
  switch (operator) {
    case '+':
      return { ...result, value: left + right }
    case '-':
      return { ...result, value: left - right }
    case '*':
      return { ...result, value: left * right }
    case '/':
      // TODO: handle division by zero
      return { ...result, value: left / right }
    case '^':
      return { ...result, value: left ** right }
    case '%':
      return { ...result, value: left % right }
    default:
      throw new Error(`Runtime error: Unknown operator ${operator} given`)
  }
}

export function evalBinaryExpression(
  binaryOperation: BinaryExpression,
  env: Environment
): RuntimeValue {
  const { left, right, operator } = binaryOperation

  const leftHandSide = evaluate(left, env) as NumberValue
  const rightHandSide = evaluate(right, env) as NumberValue

  if (leftHandSide.type === 'number' && rightHandSide.type === 'number') {
    return evalNumericBinaryExpression(
      leftHandSide.value,
      rightHandSide.value,
      operator
    )
  }

  return makeNull()
}

export function evalIdentifier(
  identifier: Identifier,
  env: Environment
): RuntimeValue {
  return env.lookupVariable(identifier.symbol)
}

export function evalAssignment(
  node: AssignmentExpression,
  env: Environment
): RuntimeValue {
  if (node.assigne.type !== 'Identifier') {
    throw new Error(`Cannot assign, invalid LHS inside assignment expression`, {
      cause: node.assigne,
    })
  }

  const varName = (node.assigne as Identifier).symbol
  return env.assignVariable(varName, evaluate(node.value, env))
}

export function evalObjectExpression(
  obj: ObjectLiteral,
  env: Environment
): RuntimeValue {
  const object = { type: 'object', properties: new Map() } as ObjectValue

  obj.properties.forEach(({ key, value }) => {
    const runtimeVal =
      value === undefined ? env.lookupVariable(key) : evaluate(value, env)
    object.properties.set(key, runtimeVal)
  })

  return object
}
