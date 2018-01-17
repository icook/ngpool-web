import React, { Component } from 'react';
import {Redirect} from 'react-router-dom'
import num from 'num'
import TimeAgo from 'react-timeago'

class Market extends Component {
  constructor(props){
    super(props);
    this.state = {
      amount: null,
      price: null,
			sellLiquidity: {},
			buyLiquidity: {},
			recentTrades: [],
    };
    this.market = this.props.markets[this.props.match.params.id]
    this.firstLoad = true;
    this.websocket = null;
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event){
    event.preventDefault()
    event.stopPropagation()
    this.props.axios.post("sell_limit", {
      amount: this.state.newPassword,
      price: this.state.oldPassword,
    }).then(res => {
      this.setState({msgType: "success", msg: "Password changed"})
    }).catch(error => {
      this.setState({msgType: "error", msg: error.response.data.errors[0].title})
    });
  }
  randomString (length) {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for(var i = 0; i < length; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
  }
  updateLiquidity(updates, book) {
    for (var priceRaw in updates) { 
      var price = num(priceRaw).set_precision(8);
      var change = num(updates[price]).set_precision(8);
      if (book[price] === undefined) {
        book[price] = {price: price, amount: num(0)}
      }
      book[price].amount = change.add(book[price].amount)
      if (book[price].amount == 0) {
        delete book[price];
      }
    }
    return book
  }
  msg(msg) {
    var dat = JSON.parse(msg.data);
    this.setState((prevState, props) => {
      var {recentTrades, sellLiquidity, buyLiquidity} = prevState
      buyLiquidity = this.updateLiquidity(dat.blu, buyLiquidity)
      sellLiquidity = this.updateLiquidity(dat.slu, sellLiquidity)

      if (dat.tu !== null) {
        for (var trade of dat.tu) {
          trade.t = dat.time
          recentTrades.unshift(trade)
        }
        recentTrades = recentTrades.slice(0, 100)
      }
      return {
        recentTrades: recentTrades,
        sellLiquidity: sellLiquidity,
        buyLiquidity: buyLiquidity
      }
    }, () => {
      // Only do this when loading initial data
      if (this.firstLoad) {
        this.refs["spread"].scrollIntoView(
          {behavior: "instant", block: "center", inline: "center"})
        this.firstLoad = false;
      }
    })
  }
  componentDidMount() {
    var channel = "market_" + this.market.id;

    this.websocket = new WebSocket("ws" + process.env.REACT_APP_URI_ROOT + "ws");
    this.websocket.onmessage = this.msg.bind(this);
    this.websocket.onopen = (dat) => {
      this.websocket.send(JSON.stringify({
        method: "subscribe",
        channel: channel,
        nonce: this.randomString(8),
      }));
    }
  }
  render() {
    var {recentTrades, sellLiquidity, buyLiquidity} = this.state
    if (this.state.redirect) // For 403 handling
      return (<Redirect to={{pathname: '/logout'}}/>)
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h3>Recent Trades</h3>
            <div className="liquidity-container" style={{height: 370}}>
              <table className="table table-liquidity" style={{marginBottom: 0}}>
                <thead>
                  <tr>
                    <th>Price ({this.market.base_currency})</th>
                    <th>Amount ({this.market.market_currency})</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  { recentTrades.map((trade) => (
                  <tr>
                    <td>{trade.p}</td>
                    <td>{trade.a}</td>
                    <td><TimeAgo date={trade.t} /></td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-md-6">
            <h3>Orderbook</h3>
            <table className="table table-liquidity" style={{marginBottom: 0}}>
              <thead>
                <tr>
                  <th width="50%">Price ({this.market.base_currency})</th>
                  <th>Amount ({this.market.market_currency})</th>
                </tr>
              </thead>
            </table>
            <div className="liquidity-container">
              <table className="table table-liquidity">
                <tbody className="buy">
                  { Object.keys(buyLiquidity).sort().slice(-25, -1).map((price) => (
                  <tr key={price}>
                    <td width="50%">{buyLiquidity[price].price.toString()}</td>
                    <td>{buyLiquidity[price].amount.toString()}</td>
                  </tr>
                  ))}
                </tbody>
                <tbody>
                  <tr>
                    <td colSpan="2" ref="spread">Spread</td>
                  </tr>
                </tbody>
                <tbody className="sell">
                  { Object.keys(sellLiquidity).sort().slice(-25, -1).map((price) => (
                  <tr key={price}>
                    <td>{sellLiquidity[price].price.toString()}</td>
                    <td>{sellLiquidity[price].amount.toString()}</td>
                  </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    )}
}
export default Market
