import React, { Component } from 'react';
import 'react-select/dist/react-select.css';
import MDSpinner from 'react-md-spinner';
import {HashrateGraph, HashrateVal} from './Workers.js'
import moment from 'moment';

class Overview extends Component {
  constructor(props){
    super(props);
    this.state = {
      minuteShares: [],
      loading: false,
    }
    this.load = this.load.bind(this);
  }
  load() {
    var end = moment().startOf('minute')
    var start = end.subtract(1, 'hours')
    this.setState({loadingMinuteShares: true}, () => {
      this.props.axios.get("minute_shares/sharechain",
        {params: {start: start.unix()}}).then(res => {
          this.setState({minuteShares: res.data.data.minute_shares, loading: false})
        }).catch(error => {
          console.log(error)
          this.setState({loading: false})
        })
    })
  }
  componentDidMount() {
    this.load()
  }
  render() {
    var rows
    if (this.state.loading) {
      rows = (<tr><td colSpan="8" className="jumbotron text-center">
        <div className="jumbotron"><MDSpinner size={50}/></div>
      </td></tr>)
    } else {
      console.log(this.props)
      rows = Object.keys(this.props.common.sharechains).map((name) => {
        var sharechain = this.props.common.sharechains[name]
        var minuteShares = this.state.minuteShares[name]
        if (minuteShares === undefined)
          minuteShares = []
        var hashrate = 0;
        if (minuteShares.length > 0) {
          hashrate = minuteShares[minuteShares.length - 1].hashrate;
        }
        var rows = [(<tr key={name}>
          <td>{name}</td>
          <td>{sharechain.algo}</td>
          <td><HashrateVal amount={hashrate}/></td>
        </tr>)]
        rows.push(
          <tr key={name + "-graph"}>
            <td colSpan="3">
              <HashrateGraph slices={minuteShares}/>
            </td>
          </tr>)
        return rows
      })
    }
    return (
      <div className="container">    
        <h2>Pool Overview</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Sharechain</th>
              <th>Algorithm</th>
              <th>Hashrate</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
      )}
}
export default Overview
