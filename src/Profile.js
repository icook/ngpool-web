import React, { Component } from 'react';
import {Redirect} from 'react-router-dom'
import {Alert} from './App.js'

class PayoutAddress extends Component {
  constructor(props){
    super(props);
    this.state = {
			newVal: this.props.address,
      msg: '',
      msgtype: ''
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(){
    this.props.axios.post("user/setpayout",
      {address: this.state.newVal, currency: this.props.currency})
			.then(res => {
        this.setState({
          msg: 'Successfully updated',
          msgtype: 'success'
        })
			}).catch(error => {
        this.setState({
          msg: error.response.data.errors[0].title,
          msgtype: 'error'
        })
			});
		console.log(this.state.newVal)
		console.log(this.props.currency)
  }
	render() {
		return (
			<tr>
				<th scope="row">{this.props.currency}</th>
				<td>
          <Alert type={this.state.msgtype} msg={this.state.msg} />
					<div className="input-group">
						<input type="text" className="form-control" value={this.state.newVal}
							onChange={(event) => this.setState({newVal: event.target.value})}/>
						<span className="input-group-btn">
							<button className="btn btn-info" type="button" onClick={() => this.handleSubmit()} >
								Set</button>
						</span>
					</div>
				</td>
			</tr>
		)
	}
}

class Profile extends Component {
  constructor(props){
    super(props);
    this.state = {
			user: {},
			payoutAddrs: {},
    };
  }
  componentDidMount() {
    this.props.axios.get("user/me")
			.then(res => {
				var resp = res.data.data
        this.setState({
					user: resp.user,
					payoutAddrs: resp["payout_addresses"]
				})
			}).catch(error => {
        if (error.response.status === 403) {
          this.setState({redirect: true})
        }
        this.setState({error: error.response.data.errors[0].title})
			});
  }
  render() {
    if (this.state.redirect)
      return (<Redirect to={{pathname: '/logout'}}/>)
		var addrs = this.state.payoutAddrs
		var rows = Object.keys(addrs).map((key) => (
			<PayoutAddress axios={this.props.axios} key={key} currency={key} address={addrs[key]} />))
    return (
      <div className="container">    
        <h2>Profile</h2>
        <table className="table table-striped">
					<tbody>
          <tr>
            <th scope="row">Username</th>
            <td>{ this.state.user.username }</td>
          </tr>
          <tr>
            <th scope="row">Email</th>
            <td>{ this.state.user.email }</td>
          </tr>
				</tbody>
        </table>
        <h2>Payout Addresses</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">Currency</th>
              <th scope="col">Payout Address</th>
            </tr>
          </thead>
          <tbody>
						{rows}
          </tbody>
        </table>
      </div>
    )}
}
export default Profile
