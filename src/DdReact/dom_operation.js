import {
  TEXT_ELEMENT,
  isEvent,
  isAttribute,
} from './utils'
/**
 * 更新dom的属性
 * @param {domNode} dom // 当前dom节点
 * @param {object} prevProps // 老props
 * @param {object} newProps // 新props
 */
export function updateDomProperties(dom, prevProps = {}, newProps = {}) {
  let prevkeys = Object.keys(prevProps)
  let newKeys = Object.keys(newProps)
  prevkeys.forEach(key => {
    if(isEvent(key)) {
      dom.removeEventListener(key.toLowerCase().substring(2))
    } else if(isAttribute(key)){
      dom[key] = null
    }
  })
  newKeys.forEach(key => {
    if(isEvent(key)) {
      const eventName = key.toLowerCase().substring(2)
      dom.addEventListener(eventName, newProps[key])
    } else if(isAttribute(key)){
      dom[key] = newProps[key]
    }
  })
}

/**
 * 创建dom节点
 * @param {object} fiber 
 */
export function createDomElement(fiber) {
  const {type} = fiber
  const isPlainText = type === TEXT_ELEMENT
  let dom = null
  if(isPlainText) {
    dom = document.createTextNode('')
  } else {
    dom = document.createElement(type)
  }
  updateDomProperties(dom, {} ,fiber.props)
  return dom
}