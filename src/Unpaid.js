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
      pending: {},
      loading: false,
    }
    this.load = this.load.bind(this);
  }
  load() {
    this.setState({loading: true}, () => {
      this.props.axios.get("user/unpaid").then(res => {
          var credits = res.data.data.credits
          var pending = {}
          for (var credit of credits) {
            if (!(credit.currency in pending))
              pending[credit.currency] = 0
            pending[credit.currency] += credit.amount
          }
          this.setState({credits: credits, pending: pending, loading: false})
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
    var {credits, pending} = this.state
    var creditRows, summaryRows
    if (this.state.loading) {
      creditRows = summaryRows = (<tr><td colSpan="8" className="jumbotron text-center">
        <div className="jumbotron"><MDSpinner size={50}/></div>
      </td></tr>)
    } else {
      creditRows = Object.keys(credits).map((i) => (
        <tr key={credits[i].id}>
          <td>{credits[i].blockhash}</td>
          <td>{credits[i].currency}</td>
          <td><CurrencyVal amount={credits[i].amount}/></td>
          <td>{credits[i].sharechain}</td>
          <td><TimeAgo date={credits[i].mined_at} /></td>
        </tr>))
      summaryRows = Object.keys(pending).map((currency) => (
        <tr key={currency}>
          <th scope="col">{currency}</th>
          <td><CurrencyVal amount={pending[currency]}/></td>
        </tr>))
    }
    return (
      <div className="container">    
        <h2>Unpaid Summary</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Currency</th>
              <th>Unpaid Total</th>
            </tr>
          </thead>
          <tbody>
            {summaryRows}
          </tbody>
        </table>
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
            {creditRows}
          </tbody>
        </table>
      </div>
      )}
}

export default Unpaid
