import React, { Component } from 'react';
import {Redirect} from 'react-router-dom'
import num from 'num'

class Market extends Component {
  constructor(props){
    super(props);
    this.state = {
      amount: null,
      price: null,
			sellLiquidity: {},
			buyLiquidity: {},
			trades: [],
    };
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
  msg(msg) {
    var dat = JSON.parse(msg.data);
    this.setState((prevState, props) => {
      var {sellLiquidity, buyLiquidity} = prevState
      for (var priceRaw in dat.blu) { 
        var price = num(priceRaw);
        var change = num(dat.blu[priceRaw]);
        if (buyLiquidity[priceRaw] === undefined) {
          buyLiquidity[priceRaw] = {price: price, amount: num(0)}
        }
        buyLiquidity[priceRaw].amount = change.add(buyLiquidity[price].amount)
        if (buyLiquidity[priceRaw].amount == 0) {
          delete buyLiquidity[priceRaw];
        }
      }
      for (priceRaw in dat.slu) { 
        price = num(priceRaw);
        change = num(dat.slu[priceRaw]);
        if (sellLiquidity[priceRaw] === undefined) {
          sellLiquidity[priceRaw] = {price: price, amount: num(0)}
        }
        sellLiquidity[priceRaw].amount = change.add(sellLiquidity[priceRaw].amount)
        if (sellLiquidity[priceRaw].amount == 0) {
          delete sellLiquidity[priceRaw];
        }
      }
      return {sellLiquidity: sellLiquidity, buyLiquidity: buyLiquidity}
    }, () => {
      // Only do this when loading initial data
      if (this.firstLoad) {
        this.refs["spread"].scrollIntoView(
          {behavior: "instant", block: "center", inline: "center"})
        this.firstLoad = false;
      }
      }
    )
  }
  componentDidMount() {
    var channel = "market_" + this.props.match.params.id;

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
    var {sellLiquidity, buyLiquidity} = this.state
    if (this.state.redirect) // For 403 handling
      return (<Redirect to={{pathname: '/logout'}}/>)
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h3>Orderbook</h3>
            <table className="table" style={{marginBottom: 0}}>
              <thead>
                <tr>
                  <th>Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
            </table>
            <div className="liquidity-container">
              <table className="table table-liquidity">
                <tbody className="buy">
                  { Object.keys(buyLiquidity).sort().slice(-25, -1).map((price) => (
                  <tr key={price}>
                    <td>{buyLiquidity[price].price.toString()}</td>
                    <td>{buyLiquidity[price].amount.toString()}</td>
                  </tr>
                  ))}
                </tbody>
                <tr>
                  <td colSpan="2" ref="spread">Spread</td>
                </tr>
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
