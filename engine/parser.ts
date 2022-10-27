import type {
  BinaryExpression,
  Expression,
  Identifier,
  NumericLiteral,
  Program,
  Statement,
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

  // Order of precedence:
  // Addition
  // Multiplication
  // Primary
  #parseExpression(): Expression {
    return this.#parseAdditiveExpression()
  }

  #parseStatement(): Statement {
    // skip to parseExpr
    return this.#parseExpression()
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
