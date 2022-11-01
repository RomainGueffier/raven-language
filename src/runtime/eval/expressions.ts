import {
  AssignmentExpression,
  BinaryExpression,
  Identifier,
} from '../../syntax/ast'
import Environment from '../environment'
import { evaluate } from '../interpreter'
import { makeNull, NumberValue, RuntimeValue } from '../values'

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
