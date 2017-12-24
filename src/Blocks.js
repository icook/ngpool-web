import React, { Component } from 'react';
import TimeAgo from 'react-timeago'
import Select from 'react-select';
import 'react-select/dist/react-select.css';

class BlockRow extends Component {
  constructor(props){
    super(props);
    this.state = {
			extra: null,
    }
    this.load = this.load.bind(this);
  }
  load () {
    if (this.state.extra) {
      this.setState({extra: null})
      return
    }
    this.props.axios.get("block/" + this.props.block.hash)
			.then(res => {
        this.setState({extra: res.data.data.block})
			}).catch(error => {
        console.log(error)
			});
  }
  render() {
    var block = this.props.block;
    var extra = '';
    if (this.state.extra) {
      var det = this.state.extra
      extra = (
			<tr>
				<td colSpan="7">
          <h4>Block Details</h4>
          <table className="table table-striped">
            <tbody>
            <tr>
              <th scope="col">Hash</th>
              <td><code>{block.hash}</code></td>
            </tr>
            <tr>
              <th scope="col">PoW Hash</th>
              <td><code>{det.powhash}</code></td>
            </tr>
            <tr>
              <th scope="col">Payout Data</th>
              <td><code>{JSON.stringify(det.payout_data, null, 2)}</code></td>
            </tr>
            </tbody>
          </table>
        </td>
			</tr>)
    }
    return ([
      <tr onClick={this.load} style={{cursor: 'pointer'}}>
        <td><i className="glyphicon glyphicon-plus" /></td>
        <td>{block.currency}</td>
        <td>{block.height}</td>
        <td>{block.difficulty}</td>
        <td>{block.powalgo}</td>
        <td><TimeAgo date={block.mined_at} /></td>
        <td>{block.status}</td>
      </tr>,
      extra
    ])
  }
}

class Blocks extends Component {
  constructor(props){
    super(props);
    this.state = {
      blocks: [],
      maturity: null,
    }
    this.load = this.load.bind(this);
    this.setFilter = this.setFilter.bind(this);
  }
  load() {
    this.props.axios.get("blocks",
      {params: {maturity: this.state.maturity}}
    ).then(res => {
        this.setState({blocks: res.data.data.blocks})
			}).catch(error => {
        console.log(error)
			});
  }
  setFilter(update) {
    this.setState(update, this.load)
  }
  componentDidMount() {
    this.load()
  }
  render() {
    var blocks = this.state.blocks
		var rows = Object.keys(blocks).map((key) => (
			<BlockRow axios={this.props.axios} block={blocks[key]} />))
    return (
      <div className="container">    
        <div className="col-md-4">
          <h2>Recent Blocks</h2>
          <div className="form-group">
            <label>Maturity</label>
            <Select value={this.state.maturity} multi={true} simpleValue={true}
              onChange={(e) => this.setFilter({'maturity': e})}
              options={[
                  { value: 'mature', label: 'Mature' },
                  { value: 'immature', label: 'Immature' },
                  { value: 'orhpan', label: 'Orphan' },
                ]}/>
          </div>
        </div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col"></th>
              <th scope="col">Currency</th>
              <th scope="col">Height</th>
              <th scope="col">Difficulty</th>
              <th scope="col">Algo</th>
              <th scope="col">Time</th>
              <th scope="col">Status</th>
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
