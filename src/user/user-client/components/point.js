import React, { Component, Fragment } from 'react';
import * as utils from '../../../utils/client';
import { connect } from 'react-redux';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, Cell} from 'recharts';
import axios from 'axios';
import { updatePoints } from '../actions';

class Point extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chartSize: false
    }
    this.chartWrapper = React.createRef();
  }

  async componentDidMount() {
    axios('/user/get-updated-points').then(response => {
      if ( response.data.error ) {
        this.props.openAlertModal(true, 'error', response.data.error, false, this.props.closeAlertModal);
        return;
      }
      this.props.updatePoints(response.data);
      this.setState({
        chartSize: {
          horizontal: {
            width: this.chartWrapper.current.offsetWidth - 20,
            height: this.chartWrapper.current.offsetHeight - 40, // for top, bottom padding
            margin: {
              top: 0,
              right: 10,
              left: 0,
              bottom: 0
            },
            barSize: (this.props.chartData.length < 9) ? 30 : 20
          },
          vertical: {
            width: this.chartWrapper.current.offsetWidth - 20,
            height: this.chartWrapper.current.offsetHeight - 40, // for top, bottom padding
            margin: {
              top: 0,
              right: 10,
              left: -20,
              bottom: 0
            },
            barSize: (this.props.chartData.length < 9) ? 30 : 20
          }
        }
      });
    }).catch(e => {
      this.props.openAlertModal(true, 'error', e, false, this.props.closeAlertModal);
    });
  }
  render() {
    let chart;
    if ( this.state.chartSize ) {
      if (this.props.chartData.length < 6) {
        chart = <BarChart width={this.state.chartSize.horizontal.width} height={this.state.chartSize.horizontal.height} data={this.props.chartData} margin={this.state.chartSize.horizontal.margin} barSize={this.state.chartSize.horizontal.barSize} stackOffset="silhouette" reverseStackOrder={true}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis type="category" dataKey="teamText"/>
                  <YAxis type="number" dataKey="point"/>
                  <Tooltip active/>
                  <Bar dataKey="point">
                    <LabelList dataKey="point" position="top"/>
                    {
                      this.props.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ (entry.team == this.props.ourTeam) ? '#daa520' : '#8884d8' }/>
                      ))
                    }
                  </Bar>
                </BarChart>;
      } else {
        chart = <BarChart width={this.state.chartSize.vertical.width} height={this.state.chartSize.vertical.height} layout="vertical" data={this.props.chartData} margin={this.state.chartSize.vertical.margin} barSize={this.state.chartSize.vertical.barSize}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis type="number" dataKey="point"/>
                  <YAxis type="category" dataKey="teamText"/>
                  <Tooltip active/>
                  <Bar dataKey="point" label={{ fill: 'white', fontSize: 18 }}>
                    {
                      this.props.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={ (entry.team == this.props.ourTeam) ? '#daa520' : '#8884d8' }/>
                      ))
                    }
                  </Bar>
                </BarChart>;
      }
    }
    return (
      <div className="point-page full-container">
        <h2 className="title">팀별 가용점수</h2>
        <div className="chart-wrapper" ref={this.chartWrapper}>
          {chart}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  var chartData = [];
  for ( var i = 0; i < state.teamCount; i++ ) {
    let team = state.points[i].team;
    let data = {
      team,
      teamText: team+'팀',
      point: state.points[i].useable
    }
    chartData.push(data);
  }

  return {
    ourTeam: ( state.loginData ? state.loginData.team : false ),
    teamCount: state.teamCount,
    chartData
  };
}

export default connect(mapStateToProps, { updatePoints })(Point);