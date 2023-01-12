import type {
  AssignmentExpression,
  BinaryExpression,
  CallExpression,
  Identifier,
  NumericLiteral,
  ObjectLiteral,
  Program,
  Statement,
  VarDeclaration,
} from '../syntax/ast.js'
import Environment from './environment.js'
import {
  evalAssignment,
  evalBinaryExpression,
  evalCallExpression,
  evalIdentifier,
  evalObjectExpression,
} from './eval/expressions.js'
import { evalProgram, evalVarDeclaration } from './eval/statements.js'
import { NumberValue, RuntimeValue } from './values.js'

export function evaluate(astNode: Statement, env: Environment): RuntimeValue {
  switch (astNode.type) {
    case 'NumericLiteral':
      const { value } = astNode as NumericLiteral
      return { value, type: 'number' } as NumberValue

    case 'Identifier':
      return evalIdentifier(astNode as Identifier, env)

    case 'ObjectLiteral':
      return evalObjectExpression(astNode as ObjectLiteral, env)

    case 'CallExpression':
      return evalCallExpression(astNode as CallExpression, env)

    case 'AssignmentExpression':
      return evalAssignment(astNode as AssignmentExpression, env)

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
