import type {
  BinaryExpression,
  Identifier,
  NumericLiteral,
  Program,
  Statement,
} from '../syntax/ast'
import Environment from './environment'
import { makeNull, NumberValue, RuntimeValue } from './values'

function evalNumericBinaryExpression(
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

function evalBinaryExpression(
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

function evalIdentifier(
  identifier: Identifier,
  env: Environment
): RuntimeValue {
  return env.lookupVariable(identifier.symbol)
}

function evalProgram(program: Program, env: Environment): RuntimeValue {
  let lastEvaluated: RuntimeValue = makeNull()

  program.body.forEach((statement) => {
    lastEvaluated = evaluate(statement, env)
  })

  return lastEvaluated
}

export function evaluate(astNode: Statement, env: Environment): RuntimeValue {
  switch (astNode.type) {
    case 'NumericLiteral':
      const { value } = astNode as NumericLiteral
      return { value, type: 'number' } as NumberValue

    case 'Identifier':
      return evalIdentifier(astNode as Identifier, env)

    case 'BinaryExpression':
      return evalBinaryExpression(astNode as BinaryExpression, env)

    case 'Program':
      return evalProgram(astNode as Program, env)

    default:
      throw new Error('This AST Node has not yet been implemented', {
        cause: astNode,
      })
  }
}
