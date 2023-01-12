import {
  makeBoolean,
  makeNativeFunction,
  makeNull,
  makeNumber,
  RuntimeValue,
} from './values.js'

export function createGlobalEnvironment() {
  const env = new Environment()
  // default reserved values
  env.declareVariable('true', makeBoolean(true), true)
  env.declareVariable('false', makeBoolean(false), true)
  env.declareVariable('null', makeNull(), true)

  // native methods
  env.declareVariable(
    'print',
    makeNativeFunction((args, _scope) => {
      console.log(...args)
      return makeNull()
    }),
    true
  )
  const timeFunction = (_args: RuntimeValue[], _env: Environment) => {
    return makeNumber(Date.now())
  }
  env.declareVariable('time', makeNativeFunction(timeFunction), true)

  return env
}

export default class Environment {
  #parent?: Environment
  #variables: Map<string, RuntimeValue>
  #constants: Set<string>

  constructor(parentEnv?: Environment) {
    this.#parent = parentEnv
    this.#variables = new Map()
    this.#constants = new Set()
  }

  declareVariable(
    varName: string,
    value: RuntimeValue,
    constant: boolean
  ): RuntimeValue {
    if (this.#variables.has(varName)) {
      throw new Error(`Cannot declare variable ${varName}. Already declared`)
    }

    this.#variables.set(varName, value)

    if (constant) this.#constants.add(varName)

    return value
  }

  assignVariable(varName: string, value: RuntimeValue): RuntimeValue {
    const env = this.resolve(varName)

    // cannot assign to constants
    if (env.#constants.has(varName)) {
      throw new Error(
        `Cannot reasign to variable ${varName} because it is a constant!`
      )
    }

    env.#variables.set(varName, value)

    return value
  }

  resolve(varName: string): Environment {
    if (this.#variables.has(varName)) {
      return this
    }

    if (this.#parent === undefined) {
      throw new Error(`Cannot resolve '${varName}' in current scope`)
    }

    return this.#parent.resolve(varName)
  }

  lookupVariable(varName: string): RuntimeValue {
    const env = this.resolve(varName)
    return env.#variables.get(varName)!
  }
}
