import { NODE_TYPE, ENOUGH_TIME, EFFECT_TAGS, valueToArray, TEXT_ELEMENT, isTextElement } from './utils'
import { createDomElement, updateDomProperties } from './dom_operation'
import { createInstance } from './component'
const updateQueue = []
let nextUnitOfWork = null
let pendingCommit = null
/**
 * 将setState放入queue中
 * @param {component instance} instance 
 * @param {object} partialState 
 */
export function scheduleUpdate(instance, partialState) {
  updateQueue.push({
    from: NODE_TYPE.CLASS_COMPONENT,
    instance,
    partialState,
  })
  requestIdleCallback(performWork)
}

/**
 * render DOM
 * @param {elements} elements 
 * @param {domNode} dom 
 */
export function render(elements, dom) {
  updateQueue.push({
    from: NODE_TYPE.HOST_ROOT,
    props: {children: elements},
    dom,
  })
  requestIdleCallback(performWork)
}

function performWork(deadline) {
  workloop(deadline)
  if(nextUnitOfWork || updateQueue.length > 0) {
    requestIdleCallback(performWork)
  }
}
function workloop(deadline) {
  if(!nextUnitOfWork) {
    resetNextUnitOfWork()
  }
  console.log('workloop', nextUnitOfWork)
  while(nextUnitOfWork && deadline.timeRemaining() > ENOUGH_TIME) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }
  if(pendingCommit) {
    commitAllWork(pendingCommit)
  }
}
function resetNextUnitOfWork() {
  const update = updateQueue.shift()
  if(!update) {
    return
  }
  if(update.partialState) {
    update.instance.__fiber.partialState = update.partialState
  }
  const root = update.from === NODE_TYPE.HOST_ROOT ? update.dom.__rootContainerFiber : getRoot(update.instance.__fiber)
  nextUnitOfWork = {
    tag: NODE_TYPE.HOST_ROOT,
    props: update.props || root.props,
    stateNode: update.dom || root.stateNode,
    alternate: root,
  }
}
function performUnitOfWork(wipFiber) {
  beginWork(wipFiber)
  if(wipFiber.child) {
    return wipFiber.child
  }
  let fiber = wipFiber
  while(fiber) {
    completeWork(fiber)
    if(fiber.sibling) {
      return fiber.sibling
    }
    fiber = fiber.parent
  }
}

function beginWork(wipFiber) {
  console.log('beginwork', wipFiber)
  const { tag } = wipFiber
  if(tag === NODE_TYPE.CLASS_COMPONENT) {
    updateClassComponent(wipFiber)
  } else {
    updateHostComponent(wipFiber)
  }
}

function updateClassComponent(wipFiber) {
  let {stateNode: instance, props} = wipFiber
  if(!instance) {
    instance = wipFiber.stateNode = createInstance(wipFiber)
  } else if(instance.props == props && !wipFiber.partialState) {
    cloneChildFibers(wipFiber)
    return
  }
  instance.props = wipFiber.props
  instance.state = Object.assign({}, instance.state, wipFiber.partialState)
  wipFiber.partialState = null

  const elements = wipFiber.stateNode.render()
  console.log('updateClassComponent', wipFiber.stateNode, elements)
  reconcileChildArray(wipFiber, elements)
}

function updateHostComponent(wipFiber) {
  const { stateNode } = wipFiber
  if(!stateNode) {
    wipFiber.stateNode = createDomElement(wipFiber)
  }

  const childrenElements = wipFiber.props && wipFiber.props.children || []
  reconcileChildArray(wipFiber, childrenElements)
}
function cloneChildFibers(wipFiber) {
  const current = wipFiber.alternate
  if(!current.child) {
    return
  }
  let currentChild = current.child
  let prevWipChildFiber = null
  while(currentChild) {
    const {
      tag, type, stateNode, 
      props, partialState
    } = currentChild
    const newFiber = {
      tag,
      type,
      stateNode,
      props,
      partialState,
      alternate: current,
      parent: wipFiber,
    }
    if(!prevWipChildFiber) {
      wipFiber.child = newFiber
    } else {
      prevWipChildFiber.sibling = newFiber
    }
    currentChild = currentChild.sibling
    prevWipChildFiber = newFiber
  }
}

function reconcileChildArray(wipFiber, childrenElements) {
  const elementsArray = valueToArray(childrenElements)
  const current = wipFiber.alternate
  let currentChildFiber = current && current.child
  let index = 0
  let wipChildFiber = null
  while(index < elementsArray.length || currentChildFiber) {
    const prevFiber = wipChildFiber
    let element = index < elementsArray.length ? elementsArray[index] : {}
    const { props } = element
    const sameType = currentChildFiber && currentChildFiber.props == props
    const isPlainText = isTextElement(element)
    // 对于最下层textNode需要处理一下
    if(isPlainText) {
      element = {
        type: TEXT_ELEMENT,
        tag: NODE_TYPE.HOST_COMPONENT,
        props: {nodeValue: element}
      }
    }
    // 这里的effects属性将在completeWork阶段添加
    if(sameType) {
      wipChildFiber = {
        type: element.type,
        tag: currentChildFiber.tag,
        stateNode: currentChildFiber.stateNode,
        props: element.props,
        parent: wipFiber,
        alternate: currentChildFiber,
        partialState: currentChildFiber.partialState,
        effectTag: EFFECT_TAGS.UPDATE,
      }
    }
    if(element && !sameType) {
      wipChildFiber = {
        type: element.type,
        tag: (typeof element.type === 'string') ? NODE_TYPE.HOST_COMPONENT : NODE_TYPE.CLASS_COMPONENT,
        props: element.props,
        parent: wipFiber,
        effectTag: EFFECT_TAGS.PLACEMENT,
      }
    }
    // 这里添加的是将current加入到effects里面，这样在最后进行complete操作时不会忘记删除当前节点
    if(currentChildFiber && !sameType) {
      currentChildFiber.effectTag = EFFECT_TAGS.DELETION
      wipFiber.effects = wipFiber.effects || []
      wipFiber.effects.push(currentChildFiber)
    }
    if(currentChildFiber) {
      currentChildFiber = currentChildFiber.sibling
    }
    if(index === 0) {
      wipFiber.child = wipChildFiber
    } else if(prevFiber && element){
      prevFiber.sibling = wipChildFiber
    }
    index++
  }
}

/**
 * 构建effects链
 * @param {fiber} wipFiber 
 */
function completeWork(wipFiber) {
  if(wipFiber.tag === NODE_TYPE.CLASS_COMPONENT) {
    wipFiber.stateNode.__fiber = wipFiber
  }
  if(wipFiber.parent) {
    const childEffects = wipFiber.effects || []
    const thisEffects = wipFiber.effectTag ? [wipFiber] : []
    const parentEffects = wipFiber.parent.effects || []
    wipFiber.parent.effects = parentEffects.concat(childEffects, thisEffects)
  } else {
    pendingCommit = wipFiber
  }
}

function commitAllWork(fiber) {
  const { effects = [] } = fiber
  effects.forEach(e => {
    commitWork(e)
  })
  fiber.stateNode.__rootContainerFiber = fiber
  nextUnitOfWork = null
  pendingCommit = null
}

function commitWork(fiber) {
  if(fiber.tag === NODE_TYPE.HOST_ROOT) {
    return
  }
  let parentDomFiber = fiber.parent;
  while (parentDomFiber.tag === NODE_TYPE.CLASS_COMPONENT) {
    parentDomFiber = parentDomFiber.parent;
  }
  const parentDom = parentDomFiber.stateNode;
  if(fiber.effectTag === EFFECT_TAGS.PLACEMENT && fiber.tag == NODE_TYPE.HOST_COMPONENT) {
    parentDom.appendChild(fiber.stateNode)
  } else if(fiber.effectTag === EFFECT_TAGS.UPDATE) {
    updateDomProperties(fiber.stateNode, fiber.alternate.props, fiber.props)
  } else if(fiber.effectTag === EFFECT_TAGS.DELETION) {
    commitDeletion(fiber, parentDom)
  }
}

/**
 * 当前fiber如果是一个class component， 需要找到下面的dom并移除掉
 * @param {fiber} fiber 
 * @param {dom} parentDom 
 */
function commitDeletion(fiber, parentDom) {
  let node = fiber;
  while (true) {
    if (node.tag == NODE_TYPE.CLASS_COMPONENT) {
      node = node.child;
      continue;
    }
    parentDom.removeChild(node.stateNode);
    while (node != fiber && !node.sibling) {
      node = node.parent;
    }
    if (node == fiber) {
      return;
    }
    node = node.sibling;
  }
}

function getRoot(fiber) {
  let node = fiber
  while(node.parent) {
    node = node.parent
  }
  return node
}