import { reconciliation } from './render'
import { scheduleUpdate } from './reconciler'
export default class Component {
  constructor(props) {
    this.props = props
    this.state = this.state || {}
  }
  setState = (partialState) => {
    scheduleUpdate(this, partialState)
  }
}
// function updateInstance(instance) {
//   const { element, dom } = instance
//   const parentDom = dom.parentNode
//   reconciliation(element, parentDom, instance)
// }
export function createInstance(fiber) {
  const { type, props } = fiber
  const instance = new type(props)
  instance.__fiber = fiber
  return instance
}