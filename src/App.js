import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect
} from 'react-router-dom'
import "../node_modules/jquery/dist/jquery.js";
import "../node_modules/bootstrap-sass/assets/javascripts/bootstrap.js";
import "../node_modules/bootstrap-sass/assets/stylesheets/_bootstrap.scss";
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import './App.scss';

import Profile from './Profile.js'
import Blocks from './Blocks.js'
import Services from './Services.js'
import Login from './Login.js'
import SignUp from './Signup.js'

const Credits = () => (
  <div>
    <h2>Credits</h2>
  </div>
)

export class Alert extends Component {
    render () {
      var className = "alert "
      switch (this.props.type) {
      case "error":
        className += "alert-danger"
        break
      case "warn":
        className += "alert-warning"
        break
      case "success":
        className += "alert-success"
        break
      case "info":
        className += "alert-info"
        break
      default:
        className += "alert-warning"
      }
      return (
        <div className={className} role="alert">
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span></button>
          {this.props.msg}
        </div>)
    }
}
const PrivateRoute = ({ component: Component, render: Render, ...rest }) => (
  <Route {...rest} render={props => (
    rest.authed ? (
      Render ? (
       Render()
      ) : (
        <Component {...props}/>
      )
    ) : (
      <Redirect to={{ pathname: '/login', state: { from: props.location } }}/>
    )
  )}/>
)

class App extends Component {
  constructor(props){
    super(props);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.state = {
      loggedIn:false,
      username:'',
      user_id:'',
      token:'',
      axios: axios.create({
        baseURL: 'http://localhost:3000/v1/',
        timeout: 1000,
      })
    };
  }
  componentWillMount() {
    var user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this.login(user.username, user.userId, user.token)
    }
  }
  logout() {
    localStorage.removeItem('user')
    this.setState({
      loggedIn: false,
      username: '',
      userId: null,
      token: '',
    })
    this.state.axios.defaults.headers.common['Authorization'] = ''
  }
  login(username, userId, token){
    var tokenInfo = jwtDecode(token)
    var remaining = tokenInfo.exp - (Date.now() / 1000)
    if (remaining <= 0) {
      this.logout()
    } else {
      console.log((remaining / 60) + " minutes remaining on session")
    }
    this.setState({
      loggedIn: true,
      username: username,
      userId: userId,
      token: token,
    })
    this.state.axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
    localStorage.setItem('user', JSON.stringify({
      username: username, userId: userId, token: token}));
  }
  render() {
    return (
      <Router>
        <div>
          <nav className="navbar navbar-default">
            <div className="container-fluid">
              <div className="navbar-header">
                <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" aria-expanded="false">
                  <span className="sr-only">Toggle navigation</span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                </button>
                <Link className="navbar-brand" to="/">NgPool</Link>
              </div>

              <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                <ul className="nav navbar-nav">
                  <li><Link to="/">Blocks</Link></li>
                  { this.state.loggedIn && <li><Link to="/credits">Credits</Link></li>}
                </ul>
                <ul className="nav navbar-nav navbar-right">
                  { !this.state.loggedIn &&
                  <li><Link to="/signup"><span className="glyphicon glyphicon-user"></span> Sign Up</Link></li>
                  }
                  { !this.state.loggedIn &&
                  <li><Link to="/login"><span className="glyphicon glyphicon-log-in"></span> Login</Link></li>
                  }
                  { this.state.loggedIn &&
                  <li><Link to="/profile"><span className="glyphicon glyphicon-user"></span> {this.state.username}</Link></li>
                  }
                  { this.state.loggedIn &&
                  <li><Link to="/logout"><span className="glyphicon glyphicon-log-out"></span> Logout</Link></li>
                  }
                </ul>
              </div>
            </div>
          </nav>
          <Route path="/credits" authed={this.state.loggedIn} render={props => (
            <Credits {...props} />
            )}/>
          <PrivateRoute path="/profile" authed={this.state.loggedIn} render={props => (
            <Profile {...props} axios={this.state.axios}/>
            )}/>
          <Route path="/login" render={props => (
            <Login {...props} login={this.login} authed={this.state.loggedIn} axios={this.state.axios}/>
            )}/>
          <Route path="/signup" render={props => (
            <SignUp {...props} axios={this.state.axios}/>
            )}/>
          <Route path="/logout" render={props => {
            this.logout()
            return (<Redirect to={{ pathname: '/login'}}/>)
            }}/>
          <Route exact path="/" render={props => (
            <Blocks {...props} axios={this.state.axios}/>
            )}/>
          <Route exact path="/services" render={props => (
            <Services {...props} axios={this.state.axios}/>
            )}/>
          <footer className="footer">
            <div className="container">
              <div className="col-md-offset-8">
                <h4>Utilities</h4>
                <p className="text-muted"><Link to="/services">Service Status</Link></p>
              </div>
            </div>
          </footer>
        </div>
      </Router>
      )
}
}
export default App
