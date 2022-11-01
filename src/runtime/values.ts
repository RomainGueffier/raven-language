export type ValueType = 'null' | 'number' | 'boolean' | 'object'

export interface RuntimeValue {
  type: ValueType
}

export interface NullValue extends RuntimeValue {
  type: 'null'
  value: null
}

export function makeNull(): NullValue {
  return { type: 'null', value: null }
}

export interface BooleanValue extends RuntimeValue {
  type: 'boolean'
  value: boolean
}

export function makeBoolean(b = true): BooleanValue {
  return { type: 'boolean', value: b }
}

export interface NumberValue extends RuntimeValue {
  type: 'number'
  value: number
}

export function makeNumber(n = 0): NumberValue {
  return { type: 'number', value: n }
}

export interface ObjectValue extends RuntimeValue {
  type: 'object'
  properties: Map<string, RuntimeValue>
}
