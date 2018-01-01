import React, { Component } from 'react';
import MDSpinner from 'react-md-spinner';
import TimeAgo from 'react-timeago'
import ReactJson from 'react-json-view'

class ServiceTable extends Component {
  render() {
    var services = this.props.services
    var rows
    if (this.props.loading) {
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
      )
  }
}

class Services extends Component {
  constructor(props){
    super(props);
    this.state = {
      stratums: [],
      coinservers: [],
      loading: false,
    }
    this.load = this.load.bind(this);
  }
  load() {
    this.setState({loading: true}, () => {
      this.props.axios.get("services").then(res => {
        var data = res.data.data
        this.setState({
          coinservers: Object.values(data.coinservers),
          stratums: Object.values(data.stratums),
          loading: false,
        })
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
    var {loading, stratums, coinservers} = this.state
    return (
      <div className="container">    
        <h2>Stratums</h2>
        <ServiceTable services={stratums} loading={loading}/>
        <h2>Coinservers</h2>
        <ServiceTable services={coinservers} loading={loading}/>
      </div>
      )
  }
}

export default Services
