/**
 * @author RomainG
 * @description Tree reprensentation of program for raven programming language
 * @credits https://astexplorer.net
 */

export type NodeType =
  // Statements
  | 'Program'
  | 'VarDeclaration'

  // Expressions
  | 'AssignmentExpression'

  // Literals
  | 'Property'
  | 'ObjectLiteral'
  | 'NumericLiteral'
  | 'Identifier'
  | 'BinaryExpression'

// statement return undefined (used for declarations)
export interface Statement {
  type: NodeType
}

export interface Program extends Statement {
  type: 'Program'
  body: Statement[]
}

export interface VarDeclaration extends Statement {
  type: 'VarDeclaration'
  constant: boolean
  identifier: string
  value?: Expression
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Expression extends Statement {}

export interface AssignmentExpression extends Expression {
  type: 'AssignmentExpression'
  assigne: Expression
  value: Expression
}

export interface BinaryExpression extends Expression {
  type: 'BinaryExpression'
  left: NumericLiteral | BinaryExpression
  right: NumericLiteral | BinaryExpression
  operator: string
}

export interface Identifier extends Expression {
  type: 'Identifier'
  symbol: string
}

export interface NumericLiteral extends Expression {
  type: 'NumericLiteral'
  value: number
}

// OBJECTS
export interface Property extends Expression {
  type: 'Property'
  key: string
  value?: Expression
}

export interface ObjectLiteral extends Expression {
  type: 'ObjectLiteral'
  properties: Property[]
}
// OBJECTS
