import type {
  AssignmentExpression,
  BinaryExpression,
  CallExpression,
  Expression,
  FunctionDeclaration,
  Identifier,
  MemberExpression,
  NumericLiteral,
  ObjectLiteral,
  Program,
  Property,
  Statement,
  StringLiteral,
  VarDeclaration,
} from './ast.js'
import { Token, tokenize, TokenType } from './lexer.js'

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

      case TokenType.String:
        return {
          type: 'StringLiteral',
          value,
        } as StringLiteral

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

  // foo.x()
  #parseCallMemberExpression(): Expression {
    const member = this.#parseMemberExpression()

    if (this.#at().type === TokenType.ParenthesisOpen) {
      return this.#parseCallExpression(member)
    }

    return member
  }

  #parseCallExpression(caller: Expression): Expression {
    let callExpression: CallExpression = {
      type: 'CallExpression',
      caller,
      args: this.#parseArgs(),
    }

    if (this.#at().type === TokenType.ParenthesisOpen) {
      callExpression = this.#parseCallExpression(
        callExpression
      ) as CallExpression
    }

    return callExpression
  }

  #parseArgs(): Expression[] {
    this.#expect(TokenType.ParenthesisOpen, 'Expected open parenthesis')
    const args =
      this.#at().type === TokenType.ParenthesisClose
        ? []
        : this.#parseArgsList()

    this.#expect(
      TokenType.ParenthesisClose,
      'Missing closing parenthesis inside argument list'
    )
    return args
  }

  #parseArgsList(): Expression[] {
    const args = [this.#parseAssignmentExpression()]

    while (
      this.#notEOF() &&
      this.#at().type === TokenType.Comma &&
      this.#next()
    ) {
      args.push(this.#parseAssignmentExpression())
    }

    return args
  }

  #parseMemberExpression(): Expression {
    let object = this.#parsePrimaryExpression() as MemberExpression

    while (
      this.#at().type === TokenType.Dot ||
      this.#at().type === TokenType.BracketOpen
    ) {
      const operator = this.#next()
      let property: Expression
      let computed: boolean

      // no computed value aka obj.expr
      if (operator.type === TokenType.Dot) {
        computed = false
        property = this.#parsePrimaryExpression()

        if (property.type !== 'Identifier') {
          throw new Error('Cannot use dot operator on a non identifier!')
        }
      } else {
        computed = true
        property = this.#parseExpression()

        this.#expect(
          TokenType.BracketClose,
          'Missing closing bracket in computed value'
        )
      }

      object = {
        type: 'MemberExpression',
        object,
        property,
        computed,
      }
    }

    return object
  }

  /**
   * Multiplication and Division
   */
  #parseMultiplicativeExpression(): BinaryExpression {
    let left = this.#parseCallMemberExpression() as BinaryExpression

    while (this.#at().value.match(/\*|\/|\%|\^/)) {
      const operator = this.#next().value
      const right = this.#parseCallMemberExpression() as BinaryExpression
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

  #parseFunctionDeclaration(): Statement {
    this.#next() // eat fn keyword
    const name = this.#expect(
      TokenType.Identifier,
      'Expected function name following fn keyword'
    ).value

    const args = this.#parseArgs()
    const parameters: string[] = []
    args.forEach((arg) => {
      if (arg.type !== 'Identifier') {
        console.log(arg)
        throw `Inside function declaration we expect parameter to be of type string`
      }

      parameters.push((arg as Identifier).symbol)
    })

    this.#expect(
      TokenType.CurlyBracketOpen,
      'Expected function body following declaration'
    )

    const body: Statement[] = []
    while (
      this.#at().type !== TokenType.EOF &&
      this.#at().type !== TokenType.CurlyBracketClose
    ) {
      body.push(this.#parseStatement())
    }

    this.#expect(
      TokenType.CurlyBracketClose,
      'Closing curly bracket expected inside function declaration'
    )

    const fn: FunctionDeclaration = {
      body,
      name,
      parameters,
      type: 'FunctionDeclaration',
    }

    return fn
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
      case TokenType.Fn:
        return this.#parseFunctionDeclaration()
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
