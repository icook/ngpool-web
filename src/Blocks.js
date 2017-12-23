import React, { Component } from 'react';

class Blocks extends Component {
  constructor(props){
    super(props);
    this.state = {
      blocks: []
    }
  }
  componentDidMount() {
    this.props.axios.get("blocks")
			.then(res => {
        this.setState({blocks: res.data.data.blocks})
			}).catch(error => {
        console.log(error)
			});
  }
  render() {
    var blocks = this.state.blocks
		var rows = Object.keys(blocks).map((key) => (
			<tr>
				<td>{blocks[key].currency}</td>
				<td>{blocks[key].hash}</td>
				<td>{blocks[key].powalgo}</td>
				<td>{blocks[key].mined_at}</td>
			</tr>))
    return (
      <div className="container">    
        <h2>Recent Blocks</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">Currency</th>
              <th scope="col">Hash</th>
              <th scope="col">Algo</th>
              <th scope="col">Time</th>
            </tr>
          </thead>
          <tbody>
						{rows}
          </tbody>
        </table>
      </div>
    )}
}

export default Blocks
