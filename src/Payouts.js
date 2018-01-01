import React, { Component } from 'react';
import TimeAgo from 'react-timeago'
import 'react-select/dist/react-select.css';
import MDSpinner from 'react-md-spinner';
import {CurrencyVal} from './App.js';

class PayoutRow extends Component {
  constructor(props){
    super(props);
    this.state = {
      credits: [],
    }
    this.load = this.load.bind(this);
  }
  load () {
    if (this.state.credits.length) {
      this.setState({credits: []})
      return
    }
    this.props.axios.get("user/payout/" + this.props.payout.txid)
      .then(res => {
        this.setState({credits: res.data.data.credits})
      }).catch(error => {
        console.log(error)
      });
  }
  render() {
    var payout = this.props.payout;
    var ret = [(
      <tr key={payout.hash} onClick={this.load} style={{cursor: 'pointer'}}>
        <td><i className="glyphicon glyphicon-plus" /></td>
        <td>{payout.currency}</td>
        <td>{payout.txid}</td>
        <td><TimeAgo date={payout.sent} /></td>
        <td><CurrencyVal amount={payout.amount}/></td>
        <td>{payout.miner_fee}</td>
        <td>{payout.confirmed}</td>
      </tr>
    )]
    if (this.state.credits.length) {
      var credits = this.state.credits
      var rows
      rows = Object.keys(credits).map((i) => (
        <tr key={credits[i].id}>
          <td><CurrencyVal amount={credits[i].amount}/></td>
          <td>{credits[i].amount / payout.amount}</td>
          <td>{credits[i].sharechain}</td>
          <td><TimeAgo date={credits[i].mined_at} /></td>
        </tr>))
      ret.push(
      <tr key={payout.hash + "-extra"}>
        <td colSpan="7">
          <h4>Credits</h4>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Percentage</th>
                <th>Sharechain</th>
                <th>Mined At</th>
              </tr>
            </thead>
            <tbody>
              {rows}
            </tbody>
          </table>
        </td>
      </tr>)
    }
    return ret
  }
}

class Payouts extends Component {
  constructor(props){
    super(props);
    this.state = {
      payouts: [],
      page: 0,
      loading: false,
    }
    this.load = this.load.bind(this);
  }
  load() {
    this.setState({loading: true}, () => {
      this.props.axios.get("user/payouts").then(res => {
          this.setState({payouts: res.data.data.payouts, loading: false})
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
    var payouts = this.state.payouts
    var rows
    if (this.state.loading) {
      rows = (<tr><td colSpan="8" className="jumbotron text-center">
        <div className="jumbotron"><MDSpinner size={50}/></div>
      </td></tr>)
    } else {
      rows = Object.keys(payouts).map((key) => (
        <PayoutRow key={payouts[key].hash} axios={this.props.axios} payout={payouts[key]} />))
    }
    return (
      <div className="container">    
        <h2>Your Payouts</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th></th>
              <th>Currency</th>
              <th>Hash</th>
              <th>Time</th>
              <th>Amount</th>
              <th>Miner Fee</th>
              <th>Confirmed</th>
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

export default Payouts
