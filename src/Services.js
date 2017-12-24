import React, { Component } from 'react';
import MDSpinner from 'react-md-spinner';
import TimeAgo from 'react-timeago'
import ReactJson from 'react-json-view'

class Services extends Component {
  constructor(props){
    super(props);
    this.state = {
      services: [],
      loading: false,
    }
    this.load = this.load.bind(this);
  }
  load() {
    this.setState({loading: true}, () => {
      this.props.axios.get("coinservers").then(res => {
          this.setState({services: Object.values(res.data.data.coinservers), loading: false})
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
    var services = this.state.services
    var rows
    if (this.state.loading) {
      rows = (<tr><td colSpan="8" className="jumbotron text-center">
        <div className="jumbotron"><MDSpinner size={50}/></div>
      </td></tr>)
    } else {
      rows = Object.keys(services).map((key) => {
        var svc = services[key]
        return (
        <tr>
          <td>{svc.service_id}</td>
          <td><ReactJson src={svc.status} displayDataTypes={false} indentWidth={2} name={null} enableClipboard={false} /></td>
          <td><ReactJson src={svc.labels} displayDataTypes={false} indentWidth={2} name={null} enableClipboard={false} /></td>
          <td><TimeAgo date={svc.update_time} /></td>
        </tr>)})
    }
    return (
      <div className="container">    
        <h2>Service Status</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Status</th>
              <th scope="col">Labels</th>
              <th scope="col">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
      )
  }
}

export default Services
