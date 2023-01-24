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
  // Literal types
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  Identifier = 'identifier',

  // keywords
  Let = 'mutable-var',
  Const = 'constant-var',
  Fn = 'function',

  // Grouping
  ParenthesisOpen = 'parenthesis-open',
  ParenthesisClose = 'parenthesis-close',
  BracketOpen = 'bracket-open',
  BracketClose = 'bracket-close',
  CurlyBracketOpen = 'bracket-curly-open',
  CurlyBracketClose = 'bracket-curly-close',
  Comma = 'comma',
  Dot = 'dot',
  Colon = 'colon',
  Semi = 'semi', // end of line
  EOF = 'eof', // end of file

  // Operations
  BinaryOperator = 'binary-operator',
  EqualOperator = 'equal-operator',

  // Quotes
  DoubleQuotes = 'double-quotes',

  // Comments
  CommentInline = 'comment-inline',
  CommentBlock = 'comment-block',
}

export interface Token {
  value: string
  type: TokenType
}

const TOKEN_RESERVED_KEYWORDS: Record<string, TokenType> = {
  let: TokenType.Let,
  const: TokenType.Const,
  fn: TokenType.Fn,
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
    // removes inline comments
    if (codeChars[0] === '/' && codeChars?.[1] === '/') {
      while (codeChars.length > 0 && !codeChars[0].match(/\r|\n/)) {
        codeChars.shift()
      }
    }

    // removes bloc comments
    if (codeChars[0] === '/' && codeChars?.[1] === '*') {
      while (codeChars.length > 0 && codeChars.slice(0, 2).join('') !== '*/') {
        codeChars.shift()
      }
      codeChars.splice(0, 2) // remove ending */ double character
      continue
    }

    // skippable tabs, return, spaces
    if (codeChars[0].match(/\n|\s|\r|\t/)) {
      codeChars.shift()
      continue
    }

    // operator tokens
    switch (codeChars[0]) {
      case ';':
        tokens.push({
          value: codeChars.shift()!,
          type: TokenType.Semi,
        })
        continue
      case ',':
        tokens.push({
          value: codeChars.shift()!,
          type: TokenType.Comma,
        })
        continue
      case '.':
        tokens.push({
          value: codeChars.shift()!,
          type: TokenType.Dot,
        })
        continue
      case ':':
        tokens.push({
          value: codeChars.shift()!,
          type: TokenType.Colon,
        })
        continue
      case '[':
        tokens.push({
          value: codeChars.shift()!,
          type: TokenType.BracketOpen,
        })
        continue
      case ']':
        tokens.push({
          value: codeChars.shift()!,
          type: TokenType.BracketClose,
        })
        continue
      case '{':
        tokens.push({
          value: codeChars.shift()!,
          type: TokenType.CurlyBracketOpen,
        })
        continue
      case '}':
        tokens.push({
          value: codeChars.shift()!,
          type: TokenType.CurlyBracketClose,
        })
        continue
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
    if (codeChars[0].match(/\d/)) {
      let num = ''
      while (codeChars.length > 0 && codeChars[0].match(/\d/)) {
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
        type: reserved || TokenType.Identifier,
      })
      continue
    }

    // strings
    if (codeChars[0] === '"') {
      codeChars.shift() // ignores opening quotes

      let string = ''
      while (codeChars.length > 0 && codeChars[0] !== '"') {
        string += codeChars.shift()
      }
      tokens.push({
        value: string,
        type: TokenType.String,
      })

      codeChars.shift() // ignore closing quotes
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
