import type {
  AssignmentExpression,
  BinaryExpression,
  Expression,
  Identifier,
  NumericLiteral,
  ObjectLiteral,
  Program,
  Property,
  Statement,
  VarDeclaration,
} from './ast'
import { Token, tokenize, TokenType } from './lexer'

export default class Parser {
  #tokens: Token[] = []

  #notEOF(): boolean {
    return this.#tokens[0].type !== TokenType.EOF
  }

  #at(): Token {
    return this.#tokens[0]
  }

  /**
   * Remove current token from stack while returning its value
   * @returns a token
   */
  #next(): Token {
    return this.#tokens.shift()!
  }

  #expect(type: TokenType, error: unknown): Token {
    const token = this.#next()
    if (!token || token.type !== type) {
      throw new Error(
        `Parser error on token: ${JSON.stringify(
          token
        )}, Expecting type: ${type}`,
        {
          cause: error,
        }
      )
    }
    return token
  }

  #parsePrimaryExpression(): Expression {
    const { type, value } = this.#next()

    switch (type) {
      case TokenType.Identifier:
        return {
          type: 'Identifier',
          symbol: value,
        } as Identifier

      case TokenType.Number:
        return {
          type: 'NumericLiteral',
          value: parseFloat(value),
        } as NumericLiteral

      case TokenType.ParenthesisOpen:
        const expression = this.#parseExpression()
        this.#expect(
          TokenType.ParenthesisClose,
          'Unespected token found inside parenthesis expression. Expecting closing parenthesis'
        )
        return expression

      default:
        throw new Error(
          `Unhandled primary expression parsing at token: ${value} with type: ${type}`
        )
    }
  }

  /**
   * Multiplication and Division
   */
  #parseMultiplicativeExpression(): BinaryExpression {
    let left = this.#parsePrimaryExpression() as BinaryExpression

    while (this.#at().value.match(/\*|\/|\%|\^/)) {
      const operator = this.#next().value
      const right = this.#parsePrimaryExpression() as NumericLiteral
      left = {
        type: 'BinaryExpression',
        left,
        right,
        operator,
      }
    }

    return left
  }

  /**
   * Addition and Substraction
   * // Order of precedence:
  // Addition
  // Multiplication
  // Primary
   */
  #parseAdditiveExpression(): BinaryExpression {
    let left = this.#parseMultiplicativeExpression()

    while (this.#at().value.match(/\+|\-/)) {
      const operator = this.#next().value
      const right = this.#parseMultiplicativeExpression()
      left = {
        type: 'BinaryExpression',
        left,
        right,
        operator,
      }
    }

    return left
  }

  #parseVarDeclaration(): Statement {
    const isConstant = this.#next().type === TokenType.Const
    const identifier = this.#expect(
      TokenType.Identifier,
      'Expected identifier name following let or const keywords'
    ).value

    if (this.#at().type === TokenType.Semi) {
      this.#next()
      if (isConstant) {
        throw new Error('Must assign value to const expression!')
      }
      return {
        type: 'VarDeclaration',
        identifier,
        constant: false,
      } as VarDeclaration
    }

    this.#expect(
      TokenType.EqualOperator,
      'Expected assignation equal token following a var identifier!'
    )

    const declaration = {
      type: 'VarDeclaration',
      value: this.#parseExpression(),
      constant: isConstant,
      identifier,
    } as VarDeclaration

    this.#expect(
      TokenType.Semi,
      'Variable declaration must end with semicolon!'
    )

    return declaration
  }

  #parseObjectExpression(): Expression {
    if (this.#at().type !== TokenType.CurlyBracketOpen) {
      return this.#parseAdditiveExpression()
    }

    this.#next() // advance past open bracket

    const properties: Property[] = []

    while (this.#notEOF() && this.#at().type !== TokenType.CurlyBracketClose) {
      // parse { key: val, key2: val }
      const key = this.#expect(
        TokenType.Identifier,
        'Object key expected'
      ).value

      // allow shortland { key: pair } => { key, }
      if (this.#at().type === TokenType.Comma) {
        this.#next() // advance past the comma
        properties.push({
          key,
          type: 'Property',
        })
        continue
        // allow shortland { key: pair } => { key }
      } else if (this.#at().type === TokenType.CurlyBracketClose) {
        properties.push({ key, type: 'Property' })
        continue
      }

      this.#expect(TokenType.Colon, 'Missing colon after identifier in Object')
      const value = this.#parseExpression()

      properties.push({ type: 'Property', value, key })
      if (this.#at().type !== TokenType.CurlyBracketClose) {
        this.#expect(
          TokenType.Comma,
          'Expected comma or closing bracket following property'
        )
      }
    }

    this.#expect(
      TokenType.CurlyBracketClose,
      'Expected closing bracket for object declaration!'
    )
    return { type: 'ObjectLiteral', properties } as ObjectLiteral
  }

  #parseAssignmentExpression(): Expression {
    const left = this.#parseObjectExpression()

    if (this.#at().type === TokenType.EqualOperator) {
      this.#next()
      const value = this.#parseAssignmentExpression()

      return {
        value,
        assigne: left,
        type: 'AssignmentExpression',
      } as AssignmentExpression
    }

    return left
  }

  #parseExpression(): Expression {
    return this.#parseAssignmentExpression()
  }

  #parseStatement(): Statement {
    // skip to parseExpr
    switch (this.#at().type) {
      case TokenType.Let:
      case TokenType.Const:
        return this.#parseVarDeclaration()
      default:
        return this.#parseExpression()
    }
  }

  produceAST(sourceCode: string): Program {
    this.#tokens = tokenize(sourceCode)
    const program: Program = {
      type: 'Program',
      body: [],
    }

    while (this.#notEOF()) {
      program.body.push(this.#parseStatement())
    }

    return program
  }
}
