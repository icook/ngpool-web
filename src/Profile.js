import React, { Component } from 'react';
import {Redirect} from 'react-router-dom'
import {Alert} from './App.js'

class Profile extends Component {
  constructor(props){
    super(props);
    this.state = {
			user: {},
      msg: "",
      msgType: "",
			payoutAddrs: {},
      oldPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event){
    event.preventDefault()
    event.stopPropagation()
    this.setState({error: ''})
    if (this.state.password !== this.state.passwordConfirm) {
      this.setState({error: 'Password must match'})
      return
    }
    this.props.axios.post("user/changepass", {
      new_password: this.state.newPassword,
      old_password: this.state.oldPassword,
    }).then(res => {
      this.setState({msgType: "success", msg: "Password changed"})
    }).catch(error => {
      this.setState({msgType: "error", msg: error.response.data.errors[0].title})
    });
  }
  componentDidMount() {
    this.props.axios.get("user/me")
			.then(res => {
				var resp = res.data.data
        this.setState({user: resp.user})
			}).catch(error => {
        if (error.response.status === 403) {
          this.setState({redirect: true})
        }
        this.setState({error: error.response.data.errors[0].title})
			});
  }
  render() {
    if (this.state.redirect) // For 403 handling
      return (<Redirect to={{pathname: '/logout'}}/>)
    return (
      <div className="container">    
        <h2>Profile</h2>
        <table className="table table-striped">
					<tbody>
          <tr>
            <th scope="row">First Name</th>
            <td>{ this.state.user.fname }</td>
          </tr>
          <tr>
            <th scope="row">Last Name</th>
            <td>{ this.state.user.lname }</td>
          </tr>
          <tr>
            <th scope="row">Email</th>
            <td>{ this.state.user.email }</td>
          </tr>
				</tbody>
        </table>
        <h2>Change Password</h2>
        <Alert type={this.state.msgType} msg={this.state.msg} />
        <form onSubmit={this.handleSubmit}>
          <table className="table table-striped">
            <tbody>
            <tr>
              <th scope="row">Old Password</th>
              <td><input type="password" className="form-control" value={this.state.oldPassword}
                  onChange={(event) => this.setState({oldPassword: event.target.value})}/></td>
            </tr>
            <tr>
              <th scope="row">New Password</th>
              <td><input type="password" className="form-control" value={this.state.newPassword}
                  onChange={(event) => this.setState({newPassword: event.target.value})}/></td>
            </tr>
            <tr>
              <th scope="row">New Password Confirm</th>
              <td><input type="password" className="form-control" value={this.state.newPasswordConfirm}
                  onChange={(event) => this.setState({newPasswordConfirm: event.target.value})}/></td>
            </tr>
            <tr>
              <td colspan="2"><button type="submit" className="btn btn-success">Change</button></td>
            </tr>
          </tbody>
          </table>
        </form>
      </div>
    )}
}
export default Profile
