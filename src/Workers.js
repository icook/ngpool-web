import React, { Component } from 'react';
import 'react-select/dist/react-select.css';
import MDSpinner from 'react-md-spinner';
import { ReferenceLine, Tooltip, YAxis, XAxis, ResponsiveContainer, LineChart, Line } from 'recharts';
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
  yScale(val) {
    if (val > 1e12)
      return val / 10e12 + " Thps"
    if (val > 1e9)
      return val / 10e9 + " Ghps"
    if (val > 1e6)
      return val / 10e6 + " Mhps"
    if (val > 1e3)
      return val / 10e3 + " Khps"
    return val + " hps"
  }
  render() {
    var workers = {};
    for (var workerName of Object.keys(this.state.workers)) {
      workers[workerName] = this.state.workers[workerName]
      workers[workerName].online = true
    }
    for (var workerName of Object.keys(this.state.minuteShares)) {
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
      var timeFormat = 'ddd HH:mm'
      var end = moment().startOf('minute')
      var start = end.subtract(1, 'hours')
      var hashrateTotal = 0
      for (var slice of slices) {
        var m = moment(slice.minute)
        if (slice < start || slice > end)
          continue;
        slice.axis = m.format(timeFormat)
        slice.unix = m.unix()
        hashrateTotal += slice.hashrate
        times[slice.unix] = slice
      }
      for (var i = 0; i < 60; i++) {
        if (!(start.unix() in times)) {
          times[start.unix()] = {unix: start.unix(), hashrate: 0, axis: start.format(timeFormat)}
        }
        start.add(1, 'minute')
      }
      workers[workerName].minute_shares = Object.values(times)
      workers[workerName].average_hashrate = hashrateTotal / workers[workerName].minute_shares.length
      workers[workerName].minute_shares.sort((a, b) => a.unix - b.unix)
    }
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
                    <YAxis tickFormatter={this.yScale}/>
                    <XAxis dataKey="axis" />
                    <Line animationDuration={500} dot={false} type="monotone" dataKey="hashrate" stroke="#8884d8" />
                    <ReferenceLine y={worker.average_hashrate} label="Average"/>
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
