import type {
  BinaryExpression,
  Identifier,
  NumericLiteral,
  Program,
  Statement,
  VarDeclaration,
} from '../syntax/ast'
import Environment from './environment'
import { evalBinaryExpression, evalIdentifier } from './eval/expressions'
import { evalProgram, evalVarDeclaration } from './eval/statements'
import { NumberValue, RuntimeValue } from './values'

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

    case 'VarDeclaration':
      return evalVarDeclaration(astNode as VarDeclaration, env)

    default:
      throw new Error('This AST Node has not yet been implemented', {
        cause: astNode,
      })
  }
}
