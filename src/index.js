import DdReact from './DdReact'
/** @jsx DdReact.createElement */
const root = document.getElementById('root')
function App(text) {
  const element = (
    <div>
      <div><p>hello world</p></div>
      <div>{text}</div>
    </div>
  )
  return element
}
function App2(text) {
  const element = (
    <div>
      <div>{text}</div>
    </div>
  )
  return element
}
function App3(text) {
  const element = (
    <div>
      <div><p>hello world</p></div>
      <div>{text}</div>
      <div>{text}</div>
    </div>
  )
  return element
}
let ele = App('22')
setTimeout(() => {
  ele = App2('33')
  // ele = App3('44')
  DdReact.render(ele, root)
}, 1000)

DdReact.render(ele, root)