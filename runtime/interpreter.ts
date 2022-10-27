import type {
  BinaryExpression,
  NumericLiteral,
  Program,
  Statement,
} from '../engine/ast'
import type { NullValue, NumberValue, RuntimeValue } from './values'

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

function evalBinaryExpression(binaryOperation: BinaryExpression): RuntimeValue {
  const { left, right, operator } = binaryOperation

  const leftHandSide = evaluate(left) as NumberValue
  const rightHandSide = evaluate(right) as NumberValue

  if (leftHandSide.type === 'number' && rightHandSide.type === 'number') {
    return evalNumericBinaryExpression(
      leftHandSide.value,
      rightHandSide.value,
      operator
    )
  }

  return { type: 'null', value: 'null' } as NullValue
}

function evalProgram(program: Program): RuntimeValue {
  let lastEvaluated: RuntimeValue = { type: 'null', value: 'null' } as NullValue

  program.body.forEach((statement) => {
    lastEvaluated = evaluate(statement)
  })

  return lastEvaluated
}

export function evaluate(astNode: Statement): RuntimeValue {
  switch (astNode.type) {
    case 'NumericLiteral':
      const { value } = astNode as NumericLiteral
      return { value, type: 'number' } as NumberValue

    case 'NullLiteral':
      return { value: 'null', type: 'null' } as NullValue

    case 'BinaryExpression':
      return evalBinaryExpression(astNode as BinaryExpression)

    case 'Program':
      return evalProgram(astNode as Program)

    default:
      throw new Error('This AST Node has not yet been implemented', {
        cause: astNode,
      })
  }
}
