/**
 * @author RomainG
 * @description Tree reprensentation of program for raven programming language
 * @credits https://astexplorer.net
 */

export type NodeType =
  | 'Program'
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

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Expression extends Statement {}

export interface Identifier extends Expression {
  type: 'Identifier'
  symbol: string
}

export interface NumericLiteral extends Expression {
  type: 'NumericLiteral'
  value: number
}

export interface BinaryExpression extends Expression {
  type: 'BinaryExpression'
  left: NumericLiteral | BinaryExpression
  right: NumericLiteral | BinaryExpression
  operator: string
}
