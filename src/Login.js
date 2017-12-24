import React, { Component } from 'react';
import axios from 'axios';
import {Redirect} from 'react-router-dom'
import {Alert} from './App.js'

class Login extends Component {
  constructor(props){
    super(props);
    this.state = {
      username:'',
      password:'',
      error:'',
      redirectToReferrer: false
    };
    if (this.props.isAuthenticated) {
        this.setState({ redirectToReferrer: true })
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event){
    this.setState({error: ''})
    axios.post(`http://localhost:3000/v1/login`, this.state)
      .then(res => {
        var resp = res.data.data
        this.props.login(resp.username, resp.user_id, resp.token);
        this.setState({ redirectToReferrer: true })
      }).catch(error => {
          this.setState({error: error.response.data.errors[0].title})
      });
  }
  render() {
    const { from } = this.props.location.state || { from: { pathname: '/' } }
    const { redirectToReferrer } = this.state
    
    if (redirectToReferrer) {
      return (
        <Redirect to={from}/>
      )
    }

    return (
      <div className="container">    
        <div id="loginbox" style={{marginTop: 50}} className="mainbox col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">                    
          <div className="panel panel-info">
            <div className="panel-heading">
              <div className="panel-title">Sign In</div>
              <div style={{float: 'right', fontSize: '80%', position: 'relative', top: '-10px'}}><a href="#">Forgot password?</a></div>
            </div>     
            <div style={{paddingTop: 30}} className="panel-body">
              { this.state.error.length > 0 && <Alert type="error" msg={this.state.error} /> }

              <div style={{display: 'none'}} id="login-alert" className="alert alert-danger col-sm-12" />
              <form className="form-horizontal" role="form">
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
                <div className="input-group">
                  <div className="checkbox">
                    <label>
                      <input id="login-remember" type="checkbox" name="remember" defaultValue={1} /> Remember me
                    </label>
                  </div>
                </div>
                <div style={{marginTop: 10}} className="form-group">
                  {/* Button */}
                  <div className="col-sm-12 controls">
                    <a onClick={this.handleSubmit} className="btn btn-success">Login</a>
                  </div>
                </div>
                <div className="form-group">
                  <div className="col-md-12 control">
                    <div style={{borderTop: '1px solid#888', paddingTop: 15, fontSize: '85%'}}>
                      Don't have an account! &nbsp;
                      <a href="/signup">
                        Sign Up Here
                      </a>
                    </div>
                  </div>
                </div>    
              </form>     
            </div>                     
          </div>  
        </div>
      </div>
      )}
}

export default Login
