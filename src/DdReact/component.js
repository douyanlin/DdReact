import { isFunction } from './constant'
import { reconciliation } from './render'
export default class Component {
  constructor(props) {
    this.props = props
    this.state = this.state || {}
  }
  setState = (partialState, callback) => {
    let newState = partialState
    if(isFunction(partialState)) {
      newState = partialState.call(null)
    }
    this.state = Object.assign({}, this.state, newState)
    updateInstance(this.__internalInstance)
  }
}
function updateInstance(instance) {
  const { element, dom } = instance
  const parentDom = dom.parentNode
  reconciliation(element, parentDom, instance)
}