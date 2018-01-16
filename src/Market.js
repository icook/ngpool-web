import React, { Component } from 'react';
import {Redirect} from 'react-router-dom'

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
    console.log(dat)
    this.setState((prevState, props) => {
      var {sellLiquidity, buyLiquidity} = prevState
      for (var priceRaw in dat.blu) { 
        var price = Number(priceRaw);
        var change = Number(dat.blu[priceRaw]);
        if (buyLiquidity[price] === undefined) {
          buyLiquidity[price] = Number(0)
        }
        buyLiquidity[price] = change + buyLiquidity[price]
        if (buyLiquidity[price] == 0) {
          delete buyLiquidity[price];
        }
      }
      for (priceRaw in dat.slu) { 
        price = Number(priceRaw);
        change = Number(dat.slu[priceRaw]);
        if (sellLiquidity[price] === undefined) {
          sellLiquidity[price] = Number(0)
        }
        sellLiquidity[price] = change + sellLiquidity[price]
        if (sellLiquidity[price] == 0) {
          delete sellLiquidity[price];
        }
      }
      return {sellLiquidity: sellLiquidity, buyLiquidity: buyLiquidity}
    })
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
            <table className="table table-liquidity">
              <tbody className="buy">
                { Object.keys(buyLiquidity).sort().slice(-25, -1).map((price) => (
                <tr key={price}>
                  <td>{Number(price).toFixed(8)}</td>
                  <td>{buyLiquidity[price]}</td>
                </tr>
                ))}
              </tbody>
              <thead>
                <tr>
                  <th>Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody className="sell">
                { Object.keys(sellLiquidity).sort().slice(-25, -1).map((price) => (
                <tr key={price}>
                  <td>{Number(price).toFixed(8)}</td>
                  <td>{sellLiquidity[price]}</td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}
}
export default Market
