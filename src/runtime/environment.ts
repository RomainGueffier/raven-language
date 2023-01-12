import {
  BooleanValue,
  makeBoolean,
  makeNativeFunction,
  makeNull,
  makeNumber,
  NativeFunctionValue,
  NumberValue,
  ObjectValue,
  RuntimeValue,
  StringValue,
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
      console.log(
        args
          .map((arg) => {
            switch (arg.type) {
              case 'string':
                return (arg as StringValue).value
              case 'number':
                return (arg as NumberValue).value
              case 'boolean':
                return (arg as BooleanValue).value
              case 'null':
                return 'null'
              case 'object':
                const propertyToString = (properties: RuntimeValue) => {
                  return [...(properties as ObjectValue).properties]
                    .map((property) => {
                      let value = ''
                      switch (property[1].type) {
                        case 'object':
                          value = propertyToString(property[1])
                          break
                        case 'string':
                          value = '"' + (property[1] as StringValue).value + '"'
                          break
                        case 'null':
                          value = 'null'
                          break
                        case 'number':
                          value = (property[1] as NumberValue).value.toString()
                          break
                        case 'boolean':
                          value = (property[1] as BooleanValue).value.toString()
                          break
                        default:
                          value = 'fn'
                      }
                      return `{ ${property[0]}: ${value} }`
                    })
                    .join(', ')
                }
                return propertyToString(arg as ObjectValue)
              case 'function':
              case 'native-function':
                return (arg as NativeFunctionValue).type
              default:
                return arg
            }
          })
          .join(', ')
      )
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
