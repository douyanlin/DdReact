import DdReact from '../../DdReact'
/** @jsx DdReact.createElement */
export default class TextComp extends DdReact.Component {
  state = {
    text: 'white album'
  }
  render() {
    return (
      <div>
        <div>{this.state.text}</div>
        <p>{this.props.time}</p>
      </div>
    )
  }
} 