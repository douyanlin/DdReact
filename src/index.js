import DdReact from './DdReact'
/** @jsx DdReact.createElement */
const root = document.getElementById('root')
function App() {
  const element = (
    <div>
      <div><p>hello world</p></div>
      <div>DdReact</div>
    </div>
  )
  return element
}
const ele = App()
DdReact.render(ele, root)