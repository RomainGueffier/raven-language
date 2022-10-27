import { RuntimeValue } from './values'

export default class Environment {
  #parent?: Environment
  #variables: Map<string, RuntimeValue>

  constructor(parentEnv?: Environment) {
    this.#parent = parentEnv
    this.#variables = new Map()
  }

  declareVariable(varName: string, value: RuntimeValue): RuntimeValue {
    if (this.#variables.has(varName)) {
      throw new Error(`Cannot declare variable ${varName}. Already declared`)
    }

    this.#variables.set(varName, value)
    return value
  }

  assignVariable(varName: string, value: RuntimeValue): RuntimeValue {
    const env = this.resolve(varName)
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
