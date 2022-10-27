/**
 * @author RomainG
 * @description Raven programming language Lexer
 */

/**
 * Given a code source below ⤵
 * cho x = 22 + dieu / cai
 * We want to translate each "word" to an "token" array ⤵
 * [ Let, Identifier, EqualOperator, Number, BinaryOperator, Identifier, BinaryOperator, Identifier ]
 */
export const enum TokenType {
  // Variable types
  Null = 'null',
  Number = 'number',
  Boolean = 'boolean',

  // Variable definition
  Let = 'let',
  Identifier = 'identifier',

  // Grouping
  ParenthesisOpen = 'parenthesis-open',
  ParenthesisClose = 'parenthesis-close',
  EOF = 'eof', // end of file

  // Operations
  BinaryOperator = 'binary-operator',
  EqualOperator = 'equal-operator',
}

export interface Token {
  value: string
  type: TokenType
}

const TOKEN_RESERVED_KEYWORDS: Record<string, TokenType> = {
  cho: TokenType.Let,
  null: TokenType.Null,
}

/**
 * Convert a line of code to a tokens array
 * @param sourceCode a code text
 * @returns a collection of tokens
 */
export function tokenize(sourceCode: string): Token[] {
  const tokens: Token[] = []

  const codeChars = sourceCode.split('')

  while (codeChars.length > 0) {
    // skippable tabs, return, spaces
    if (codeChars[0].match(/\n|\s|\r|\t/)) {
      codeChars.shift()
      continue
    }

    // operator tokens
    switch (codeChars[0]) {
      case '(':
        tokens.push({
          value: codeChars.shift()!,
          type: TokenType.ParenthesisOpen,
        })
        continue
      case ')':
        tokens.push({
          value: codeChars.shift()!,
          type: TokenType.ParenthesisClose,
        })
        continue
      case '=':
        tokens.push({
          value: codeChars.shift()!,
          type: TokenType.EqualOperator,
        })
        continue
      case '+':
      case '-':
      case '/':
      case '*':
      case '^':
      case '%':
        tokens.push({
          value: codeChars.shift()!,
          type: TokenType.BinaryOperator,
        })
        continue
    }

    // multi character tokens

    // numbers
    if (codeChars[0].match(/[0-9]/)) {
      let num = ''
      while (codeChars.length > 0 && codeChars[0].match(/[0-9]/)) {
        num += codeChars.shift()
      }
      tokens.push({
        value: num,
        type: TokenType.Number,
      })
      continue
    }

    // letters
    if (codeChars[0].match(/[a-zA-Z]/)) {
      let identifier = ''
      while (codeChars.length > 0 && codeChars[0].match(/[a-zA-Z]/)) {
        identifier += codeChars.shift()
      }
      const reserved = TOKEN_RESERVED_KEYWORDS?.[identifier]
      tokens.push({
        value: identifier,
        type: reserved === TokenType.Number ? reserved : TokenType.Identifier,
      })
      continue
    }

    // throw on Unknown characters
    throw new Error(
      `Unknown character ${codeChars[0]}, cannot generate token...`
    )
  }

  tokens.push({
    value: 'END OF FILE',
    type: TokenType.EOF,
  })

  return tokens
}
