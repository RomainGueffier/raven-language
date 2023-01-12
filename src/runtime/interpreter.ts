import type {
  AssignmentExpression,
  BinaryExpression,
  CallExpression,
  FunctionDeclaration,
  Identifier,
  StringLiteral,
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
import {
  evalFunctionDeclaration,
  evalProgram,
  evalVarDeclaration,
} from './eval/statements.js'
import { NumberValue, RuntimeValue, StringValue } from './values.js'

export function evaluate(astNode: Statement, env: Environment): RuntimeValue {
  switch (astNode.type) {
    case 'NumericLiteral':
      const { value: numberVal } = astNode as NumericLiteral
      return { value: numberVal, type: 'number' } as NumberValue

    case 'StringLiteral':
      const { value: stringVal } = astNode as StringLiteral
      return { value: stringVal, type: 'string' } as StringValue

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

    case 'FunctionDeclaration':
      return evalFunctionDeclaration(astNode as FunctionDeclaration, env)

    default:
      throw new Error('This AST Node has not yet been implemented', {
        cause: astNode,
      })
  }
}
