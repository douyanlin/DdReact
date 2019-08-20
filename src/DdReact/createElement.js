export function createElement(type, config, ...children) {
  const props = Object.assign({}, config)
  props.children = children ? [...children] : []
  return {
    type,
    props
  }
}