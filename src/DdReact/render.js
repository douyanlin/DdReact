import {isTextElement} from './constant'
let rootInstance = null
/**
 * @param {*} element DdreactElement中的格式，主要有props和type两个属性
 * @param {*} parentDom 目标Dom节点
 */

export function render(element, parentDom) {
  const prevInstance = rootInstance
  const nextInstance = reconciliation(element, parentDom, prevInstance)
  rootInstance = nextInstance
}
/**
 * When a component’s props or state change, 
 * React decides whether an actual DOM update is necessary by comparing the newly returned element with the previously rendered one. 
 * When they are not equal, React will update the DOM. This process is called “reconciliation”.
 * https://reactjs.org/docs/glossary.html
 * @param {*} element
 * @param {*} parentDom
 * @param {*} instance
 * @returns
 */
function reconciliation(element, parentDom, instance) {
  let newInstance = null
  if(!instance) {
    console.log('no instance')
    newInstance = instantiate(element)
    parentDom.appendChild(newInstance.dom)
  }else if(!element) {
    console.log('no element')
    parentDom.removeChild(instance.dom)
  }else if(isTextElement(element)) { 
    newInstance = instantiate(element)
    parentDom.replaceChild(newInstance.dom, instance.dom)
  }else if(instance.element.type === element.type) {
    updateAttrToDom(instance.dom, instance.element.props, element.props)

    instance.childrenInstances = reconcileChildren(instance, element)
    instance.element = element
    newInstance = instance
  }
  else {
    newInstance = instantiate(element)
    parentDom.replaceChild(newInstance.dom, instance.dom)
  }
  return newInstance
}
// 遍历处理children
function reconcileChildren(instance, element) {
  const dom = instance.dom
  const childrenInstances = instance.childrenInstances
  const nextChildElements = element.props.children || []
  const newChildInstances = []
  const count = Math.max(childrenInstances.length, nextChildElements.length)

  for (let i = 0; i < count; i++) {
    const childInstance = childrenInstances[i]
    const childElement = nextChildElements[i]
    const newChildInstance = reconciliation(childElement, dom, childInstance)
    newChildInstances.push(newChildInstance)
  }
  return newChildInstances
}

// 创建instance: {dom, element, childrenInstance}
function instantiate(element) {     
  const { type, props = {} } = element
  const { children, ...rest } = props
  let dom = null

  // 是字符串创建TextNode
  const isTextNode = isTextElement(element)
  if(isTextNode) {
    dom = document.createTextNode('')
    dom.nodeValue = element
  } else {
    dom = document.createElement(type)
  }
  const prevProps = rootInstance ? rootInstance.element.props : {}
  rest && !isTextNode && updateAttrToDom(dom, prevProps ,rest)

  const childrenInstances = children ? children.map(instantiate) : []
  const childrenDoms = childrenInstances.map(instance => instance.dom) || []
  childrenDoms.forEach(childDom => dom.appendChild(childDom))

  return {
    dom,
    element,
    childrenInstances
  }
}

// 给dom挂属性和方法
function mountAttrToDom(props, dom) {
  const keyArray = Object.keys(props)
  for(let key of keyArray) {
    const isAttribute = !key.startsWith('on')
    const isEvent = key.startsWith('on')
    if (isEvent) {
      const eventType = key.toLowerCase().substring(2)
      dom.addEventListener(eventType, props[key])
    } else if(isAttribute) {
      dom.setAttribute(key, props[key])
    }
  }
}
// 更新dom属性和方法
function updateAttrToDom(dom, prevProps = {}, curProps = {}) {
  const prevKeyArray = Object.keys(prevProps)
  const curKeyArray = Object.keys(curProps)
  prevKeyArray.forEach(key => {
    const isAttribute = !key.startsWith('on') && key !== 'children'
    const isEvent = key.startsWith('on')
    if (isEvent) {
      const eventType = key.toLowerCase().substring(2)
      dom.removeEventListener(eventType, props[key])
    } else if(isAttribute) {
      dom.removeAttribute(key)
    }
  })

  curKeyArray.forEach(key => {
    const isAttribute = !key.startsWith('on') && key !== 'children'
    const isEvent = key.startsWith('on')
    if (isEvent) {
      const eventType = key.toLowerCase().substring(2);
      dom.addEventListener(eventType, props[key])
    } else if(isAttribute) {
      dom.setAttribute(key, props[key])
    }
  })
}