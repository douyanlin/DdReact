export const TEXT_ELEMENT = 'DDREACT_TEXT_ELEMENT'

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