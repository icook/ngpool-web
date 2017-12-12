import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom'
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import "../node_modules/jquery/dist/jquery.js";
import "../node_modules/bootstrap-sass/assets/javascripts/bootstrap.js";
import "../node_modules/bootstrap-sass/assets/stylesheets/_bootstrap.scss";
import axios from 'axios';
import './App.scss';

const Home = () => (
  <div>
    <h2>Home</h2>
  </div>
)

class Error extends Component {
    render () {
			return (<div className="alert alert-danger" role="alert">{this.props.msg}</div>)
		}
}

class Login extends Component {
  mixins: [LinkedStateMixin]
  constructor(props){
    super(props);
    this.state = {
      username:'',
      password:'',
      error:''
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event){
		this.setState({error: ''})
    axios.post(`http://localhost:3000/v1/login`, this.state)
			.then(res => {
				var resp = res.data.data
				this.props.login(resp.username, resp.user_id, resp.token);
			}).catch(error => {
					this.setState({error: error.response.data.errors[0].title})
			});
  }
  render() {
    return (
      <div className="container">    
        <div id="loginbox" style={{marginTop: 50}} className="mainbox col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">                    
          <div className="panel panel-info">
            <div className="panel-heading">
              <div className="panel-title">Sign In</div>
              <div style={{float: 'right', fontSize: '80%', position: 'relative', top: '-10px'}}><a href="#">Forgot password?</a></div>
            </div>     
            <div style={{paddingTop: 30}} className="panel-body">
              { this.state.error.length > 0 && <Error msg={this.state.error} /> }

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

class App extends Component {
  mixins: [LinkedStateMixin]
  constructor(props){
    super(props);
    this.state = {
      loggedIn:false,
      username:'',
      user_id:'',
      token:'',
    };
    this.login = this.login.bind(this);
  }
  login(username, userId, token){
		this.setState({
			loggedIn: true,
			username: username,
			userId: userId,
			token: token,
    })
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
									<li><Link to="/">Home</Link></li>
									{ this.state.loggedIn &&
										<li><Link to="/addrs">Payout Addresses</Link></li>
									}
									<li><Link to="/login">Login</Link></li>
								</ul>
							</div>
						</div>
					</nav>
					<Route path="/login" render={props => (
						<Login {...props} login={this.login} />
					)}/>
					<Route exact path="/" component={Home}/>
				</div>
			</Router>
		)
	}
}
export default App
