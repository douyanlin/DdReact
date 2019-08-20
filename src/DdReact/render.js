import { TEXT_ELEMENT } from './constant'
/**
 * @param {*} element DdreactElement中的格式，主要有props和type两个属性
 * @param {*} parentDom 目标Dom节点
 */

export function render(element, parentDom) {
  const { type, props = {} } = element
  const { children, ...rest } = props
  let dom = null

  // 是字符串创建TextNode
  const isTextNode = typeof element === 'string'
  if(isTextNode) {
    dom = document.createTextNode('')
    dom.nodeValue = element
  } else {
    dom = document.createElement(type)
  }
  rest && !isTextNode && mountAttrToDom(rest, dom)
  children && children.forEach(element => {
    render(element, dom)
  })
  parentDom.appendChild(dom)
}

// 给dom挂属性和方法
function mountAttrToDom(props, dom) {
  const keyArray = Object.keys(props)
  for(let key of keyArray) {
    const isAttribute = !key.startsWith('on')
    const isEvent = key.startsWith('on')
    if (isEvent) {
      const eventType = key.toLowerCase().substring(2);
      dom.addEventListener(eventType, props[key])
    } else if(isAttribute) {
      dom.setAttribute(key, props[key])
    }
  }
}