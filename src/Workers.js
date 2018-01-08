import React, { Component } from 'react';
import 'react-select/dist/react-select.css';
import MDSpinner from 'react-md-spinner';
import { Tooltip, XAxis, ResponsiveContainer, LineChart, Line } from 'recharts';
import moment from 'moment';

class Workers extends Component {
  constructor(props){
    super(props);
    this.state = {
      workers: [],
      minuteShares: [],
      loadingWorkers: false,
    }
    this.load = this.load.bind(this);
  }
  load() {
    this.setState({loadingMinuteShares: true}, () => {
      this.props.axios.get("minute_shares/" + this.props.username).then(res => {
          this.setState({minuteShares: res.data.data.minute_shares, loadingMinuteShares: false})
        }).catch(error => {
          console.log(error)
          this.setState({loadingMinuteShares: false})
        })
    })
    this.setState({loadingWorkers: true}, () => {
      this.props.axios.get("user/workers").then(res => {
          this.setState({workers: res.data.data.workers, loadingWorkers: false})
        }).catch(error => {
          console.log(error)
          this.setState({loadingWorkers: false})
        })
    })
  }
  componentDidMount() {
    this.load()
  }
  render() {
    var workers = {};
    for (var workerName of Object.keys(this.state.workers)) {
      workers[workerName] = this.state.workers[workerName]
      workers[workerName].online = true
    }
    for (workerName of Object.keys(this.state.minuteShares)) {
      var slices = this.state.minuteShares[workerName];
      if (!(workerName in workers)) {
        // Base information off the most recent minute share, even tho he's not
        // showing online
        var basis = slices[slices.length - 1]
        workers[workerName] = {
          hashrate: basis.hashrate,
          difficulty: basis.difficulty / basis.shares,
          online: false,
        }
      }
      var times = {}
      for (var slice of slices) {
        times[slice.minute] = slice
      }
      var start = moment().subtract(1, 'days').startOf('minute')
      for (var i = 0; i < 1440; i++) {
        var startStr = start.format()
        if (!(startStr in times)) {
          times[startStr] = {minute: startStr, hashrate: 0}
        }
        start.add(1, 'minute')
      }
      workers[workerName].minute_shares = Object.values(times)
      workers[workerName].minute_shares.sort((a, b) => new Date(a.minute) - new Date(b.minute))
    }
    console.log(workers)
    var rows
    if (this.state.loadingWorkers || this.state.loadingMinuteShares) {
      rows = (<tr><td colSpan="8" className="jumbotron text-center">
        <div className="jumbotron"><MDSpinner size={50}/></div>
      </td></tr>)
    } else {
      rows = Object.keys(workers).map((name) => {
        var worker = workers[name]
        var rows = [(<tr key={name}>
          <td>{name}</td>
          <td>{worker.hashrate}</td>
          <td>{Math.round(worker.difficulty * 100, 2) / 100}</td>
          <td>{worker.online ? "Active" : "Inactive"}</td>
        </tr>)]
        if (worker.minute_shares) {
          rows.push((
            <tr key={name + "-graph"}>
              <td colSpan="4">
                <ResponsiveContainer width="100%" height={100}>
                  <LineChart data={worker.minute_shares}>
                    <XAxis dataKey="minute" 
                      tickFormatter={timeStr => moment(timeStr).format('HH:mm')} />
                    <Line dot={false} type="monotone" dataKey="hashrate" stroke="#8884d8" />
                    <Tooltip formatter={(val, label, meta) => {
                      if (!meta.payload.stratum)
                        return "no data"
                      return (
                        <span>
                          { meta.payload.hashrate }<br/>
                          difficulty: {Math.round(meta.payload.difficulty / meta.payload.shares * 100) / 100}<br/>
                          stratum: {meta.payload.stratum}<br/>
                          sharechain: {meta.payload.sharechain}
                        </span>
                      )}}/>
                  </LineChart>
                </ResponsiveContainer>
              </td>
            </tr>
          ))
        }
        return rows
      })
    }
    return (
      <div className="container">    
        <h2>Active Workers</h2>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Hashrate</th>
              <th>Difficulty</th>
              <th>Status</th>
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