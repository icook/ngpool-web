import React, { Component } from 'react';
import TimeAgo from 'react-timeago'
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import ReactJson from 'react-json-view'
import MDSpinner from 'react-md-spinner';

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
    var ret = []
    if (this.state.extra) {
      var det = this.state.extra
      ret.push(
      <tr key={block.hash + "-extra"}>
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
              <td><ReactJson src={det.payout_data} displayDataTypes={false} indentWidth={2} name={null} enableClipboard={false} /></td>
            </tr>
            </tbody>
          </table>
        </td>
      </tr>)
    }
    ret.push(
      <tr key={block.hash} onClick={this.load} style={{cursor: 'pointer'}}>
        <td><i className="glyphicon glyphicon-plus" /></td>
        <td>{block.currency}</td>
        <td>{block.height}</td>
        <td>{block.difficulty}</td>
        <td>{block.powalgo}</td>
        <td><TimeAgo date={block.mined_at} /></td>
        <td>{block.status}</td>
      </tr>
    )
    return ret
  }
}

class Blocks extends Component {
  constructor(props){
    super(props);
    this.state = {
      blocks: [],
      maturity: null,
      currency: null,
      algo: null,
      page: 0,
      loading: false,
    }
    this.load = this.load.bind(this);
    this.setFilter = this.setFilter.bind(this);
  }
  load() {
    this.setState({loading: true}, () => {
      this.props.axios.get("blocks",
        {params: {
          maturity: this.state.maturity,
          currency: this.state.currency,
          algo: this.state.algo,
          page: this.state.page,
          page_size: 25,
        }}
      ).then(res => {
          this.setState({blocks: res.data.data.blocks, loading: false})
        }).catch(error => {
          console.log(error)
          this.setState({loading: false})
        })
    })
  }
  setFilter(update) {
    this.setState(update, this.load)
  }
  componentDidMount() {
    this.load()
  }
  render() {
    var blocks = this.state.blocks
    var rows
    if (this.state.loading) {
      rows = (<tr><td colSpan="8" className="jumbotron text-center">
        <div className="jumbotron"><MDSpinner size={50}/></div>
      </td></tr>)
    } else {
      rows = Object.keys(blocks).map((key) => (
        <BlockRow key={key} axios={this.props.axios} block={blocks[key]} />))
    }
    return (
      <div className="container">    
        <h2>Recent Blocks</h2>
        <div className="row">
          <div className="col-md-3 form-group">
            <label>Algo</label>
            <Select value={this.state.algo} multi={true} simpleValue={true}
              onChange={(e) => this.setFilter({'algo': e})}
              options={[
              { value: 'scrypt', label: 'Scrypt' },
              ]}/>
          </div>
          <div className="col-md-3 form-group">
            <label>Currency</label>
            <Select value={this.state.currency} multi={true} simpleValue={true}
              onChange={(e) => this.setFilter({'currency': e})}
              options={[
              { value: 'LTC_T', label: 'LTC_T' },
              ]}/>
          </div>
          <div className="col-md-3 form-group">
            <label>Maturity</label>
            <Select value={this.state.maturity} multi={true} simpleValue={true}
              onChange={(e) => this.setFilter({'maturity': e})}
              options={[
              { value: 'mature', label: 'Mature' },
              { value: 'immature', label: 'Immature' },
              { value: 'orphan', label: 'Orphan' },
              ]}/>
          </div>
          <div className="col-md-3 text-right">
            <a onClick={this.load} className="btn btn-default"><i className="glyphicon glyphicon-refresh" /></a>
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
        <nav aria-label="...">
          <ul className="pager">
            <li><a className="btn-lg" onClick={() => this.setFilter({page: this.state.page - 1})}>Previous</a></li>
            <li className="active"><a>{ this.state.page + 1} <span className="sr-only">(current)</span></a></li>
            <li><a className="btn-lg" onClick={() => this.setFilter({page: this.state.page + 1})}>Next</a></li>
          </ul>
        </nav>
      </div>
      )}
}

export default Blocks
