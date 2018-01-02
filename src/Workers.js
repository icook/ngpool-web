import React, { Component } from 'react';
import 'react-select/dist/react-select.css';
import MDSpinner from 'react-md-spinner';

class Workers extends Component {
  constructor(props){
    super(props);
    this.state = {
      workers: [],
      loading: false,
    }
    this.load = this.load.bind(this);
  }
  load() {
    this.setState({loading: true}, () => {
      this.props.axios.get("user/workers").then(res => {
          this.setState({workers: res.data.data.workers, loading: false})
        }).catch(error => {
          console.log(error)
          this.setState({loading: false})
        })
    })
  }
  componentDidMount() {
    this.load()
  }
  render() {
    var workers = this.state.workers
    var rows
    if (this.state.loading) {
      rows = (<tr><td colSpan="8" className="jumbotron text-center">
        <div className="jumbotron"><MDSpinner size={50}/></div>
      </td></tr>)
    } else {
      rows = Object.keys(workers).map((i) => (
        <tr key={workers[i].worker}>
          <td>{workers[i].worker}</td>
          <td>{workers[i].hashrate}</td>
          <td>{workers[i].difficulty}</td>
        </tr>))
    }
    return (
      <div className="container">    
        <h2>Active Workers</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Worker</th>
              <th>Hashrate</th>
              <th>Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
      )}
}
export default Workers
