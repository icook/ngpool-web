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
import logo from './logo.png';
import MDSpinner from 'react-md-spinner';

import Profile from './Profile.js'
import Login from './Login.js'
import SignUp from './Signup.js'

class Home extends Component {
  render() {
    return (<h1>Home babiiiiiiiii</h1>)
  }
}

export class Alert extends Component {
    render () {
      if (this.props.msg.length === 0)
        return null
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

export class CurrencyVal extends Component {
  render () {
    return (<span>{this.props.amount / 100000000}</span>)
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
      markets: [],
      loading: true,
      loggedIn: false,
      username: '',
      user_id: '',
      token: '',
      axios: axios.create({
        baseURL: process.env.REACT_APP_URI_ROOT,
        timeout: 1000,
      })
    };
  }
  componentWillMount() {
    var user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      this.login(user.username, user.userId, user.token)
    }
    this.state.axios.get("markets").then(res => {
      var markets = {}
      for (var market of res.data.data.markets) {
        markets[market.id] = market
      }
      this.setState({markets: markets, loading: false})
    }).catch(error => {
      console.log(error)
    });
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
      return
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
    var {markets} = this.state
    var body
    if (this.state.loading) {
      body = (<MDSpinner size={50}/>)
    } else {
      body = (<span>
        <PrivateRoute path="/profile" authed={this.state.loggedIn} render={props => (
          <Profile {...props} axios={this.state.axios}/>
        )}/>
        <Route path="/login" render={props => (
          <Login {...props} login={this.login} authed={this.state.loggedIn} axios={this.state.axios}/>
        )}/>
        <Route exact path="/" render={props => (
          <Home {...props}/>
        )}/>
        <Route path="/signup" render={props => (
          <SignUp {...props} axios={this.state.axios}/>
        )}/>
        <Route path="/logout" render={props => {
          this.logout()
          return (<Redirect to={{ pathname: '/login'}}/>)
        }}/>
        </span>)
    }
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
                <Link className="navbar-brand" to="/">
                  <span><img src={logo} height="25" alt="logo" className="d-inline-block align-top" /></span>&nbsp;
                  NgPool
                </Link>
              </div>

              <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                <ul className="nav navbar-nav">
                  <li><Link to="/"><i className="fa fa-search" aria-hidden="true"></i> Home</Link></li>
                  <li class="dropdown">
                    <a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">
                      <i class="fa fa-bar-chart" aria-hidden="true"></i> Markets <span class="caret"></span>
                    </a>
                    <ul class="dropdown-menu">
                      { Object.keys(markets).map((id) => (
                      <li><a href={"/market/" + id}>{markets[id].market_currency} / {markets[id].base_currency}</a></li>)) }
                      
                    </ul>
                  </li>
                </ul>
                <ul className="nav navbar-nav navbar-right">
                  { this.state.loggedIn && [
                    (<li><Link to="/profile"><span className="glyphicon glyphicon-user"></span> {this.state.username}</Link></li>),
                    (<li><Link to="/logout"><span className="glyphicon glyphicon-log-out"></span> Logout</Link></li>)
                  ]}
                  { !this.state.loggedIn && [
                  (<li><Link to="/signup"><span className="glyphicon glyphicon-user"></span> Sign Up</Link></li>),
                  (<li><Link to="/login"><span className="glyphicon glyphicon-log-in"></span> Login</Link></li>),
                  ]}
                </ul>
              </div>
            </div>
          </nav>
          { body }
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
