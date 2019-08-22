import DdReact from './DdReact'
/** @jsx DdReact.createElement */
const root = document.getElementById('root')
class App extends DdReact.Component {
  constructor(props) {
    super(props)
    this.state = {
      count: 0,
    }
  }
  handleClick = () => {
    const {count} = this.state
    this.setState({
      count: count+1,
    })
  }
  render() {
    const {count} = this.state
    return (
      <div onClick={this.handleClick}>
        <p>hello world</p>
        <p>{count}</p>
      </div>
    )
  }
}
const a = <App />
console.log('App', a)
DdReact.render(a, root)
