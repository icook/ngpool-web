import React, { Component } from 'react';
import {Redirect} from 'react-router-dom'
import {Alert} from './App.js'

class SignUp extends Component {
  constructor(props){
    super(props);
    this.state = {
      username:'',
      password:'',
      passwordConfirm:'',
      error:'',
      redirectLogin: false,
    };
    if (this.props.isAuthenticated) {
        this.setState({ redirectToReferrer: true })
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event){
    event.preventDefault()
    event.stopPropagation()
    if (this.state.password !== this.state.passwordConfirm) {
      this.setState({error: 'Password must match'})
      return
    }
    this.setState({error: ''})
    this.props.axios.post("register", this.state).then(res => {
      this.setState({ redirectLogin: true })
    }).catch(error => {
      this.setState({error: error.response.data.errors[0].title})
    });
  }
  render() {
    if (this.state.redirectLogin)
      return (<Redirect to='/login'/>)

    return (
      <div className="container">    
        <div id="loginbox" style={{marginTop: 50}} className="mainbox col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">                    
          <div className="panel panel-info">
            <div className="panel-heading">
              <div className="panel-title">Sign Up</div>
            </div>     
            <div style={{paddingTop: 30}} className="panel-body">
              <Alert type="error" msg={this.state.error} />

              <div style={{display: 'none'}} id="login-alert" className="alert alert-danger col-sm-12" />
              <form className="form-horizontal" onSubmit={this.handleSubmit}>
                <div style={{marginBottom: 25}} className="input-group">
                  <span className="input-group-addon"><i className="glyphicon glyphicon-user" /></span>
                  <input value={this.state.username} onChange={(event) => this.setState({username: event.target.value})}
                    type="text" className="form-control" placeholder="username" />
                </div>
                <div style={{marginBottom: 25}} className="input-group">
                  <span className="input-group-addon"><i className="glyphicon glyphicon-lock" /></span>
                  <input type="password" value={this.state.password} onChange={(event) => this.setState({password: event.target.value})}
                    className="form-control" name="password" placeholder="password" />
                </div>
                <div style={{marginBottom: 25}} className="input-group">
                  <span className="input-group-addon"><i className="glyphicon glyphicon-lock" /></span>
                  <input type="password" value={this.state.passwordConfirm} onChange={(event) => this.setState({passwordConfirm: event.target.value})}
                    className="form-control" name="password" placeholder="password" />
                </div>
                <div style={{marginTop: 10}} className="form-group">
                  <div className="col-sm-12 controls">
                    <button type="submit" className="btn btn-success">Sign Up</button>
                  </div>
                </div>
              </form>     
            </div>                     
          </div>  
        </div>
      </div>
      )}
}

export default SignUp
