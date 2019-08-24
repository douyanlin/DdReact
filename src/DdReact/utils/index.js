export const TEXT_ELEMENT = 'text'

function isObject(value) {
  const type = typeof value
  return value != null && (type == 'object' || type == 'function')
}
export const isTextElement = (element) => {
  return !isObject(element)
}

export const isFunction = (f) => {
  return typeof f === 'function'
}
export const isEvent = (key) => key.startsWith('on')
export const isAttribute = (key) => !key.startsWith('on') && key !== 'children' && name != "style"
export const valueToArray = (value) => !value ? [] : Array.isArray(value) ? value : [value]

export const NODE_TYPE = {
  HOST_ROOT: 'root',
  HOST_COMPONENT: 'host ',
  CLASS_COMPONENT: 'class',
}
export const ENOUGH_TIME = 1

export const EFFECT_TAGS = {
  PLACEMENT: 1,
  DELETION: 2,
  UPDATE: 3
}