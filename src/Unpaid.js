import React, { Component } from 'react';
import TimeAgo from 'react-timeago'
import 'react-select/dist/react-select.css';
import MDSpinner from 'react-md-spinner';
import {CurrencyVal} from './App.js';

class Unpaid extends Component {
  constructor(props){
    super(props);
    this.state = {
      credits: [],
      loading: false,
    }
    this.load = this.load.bind(this);
  }
  load() {
    this.setState({loading: true}, () => {
      this.props.axios.get("user/unpaid").then(res => {
          this.setState({credits: res.data.data.credits, loading: false})
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
    var credits = this.state.credits
    var rows
    if (this.state.loading) {
      rows = (<tr><td colSpan="8" className="jumbotron text-center">
        <div className="jumbotron"><MDSpinner size={50}/></div>
      </td></tr>)
    } else {
      rows = Object.keys(credits).map((i) => (
        <tr key={credits[i].id}>
          <td>{credits[i].blockhash}</td>
          <td>{credits[i].currency}</td>
          <td><CurrencyVal amount={credits[i].amount}/></td>
          <td>{credits[i].sharechain}</td>
          <td><TimeAgo date={credits[i].mined_at} /></td>
        </tr>))
    }
    return (
      <div className="container">    
        <h2>Unpaid Credits</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Block</th>
              <th>Currency</th>
              <th>Amount</th>
              <th>Sharechain</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
      )}
}

export default Unpaid
