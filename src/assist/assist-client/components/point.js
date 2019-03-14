import React, { Component, Fragment } from 'react';
import * as utils from '../../../utils/client';
import { connect } from 'react-redux';
import { Button, Row, Col, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import axios from 'axios';
import cn from 'classnames';
import NotReady from './not-ready';

class ErrorMessages extends Component {
  constructor(props) {
    super(props);

    this.renderErrorMessages = this.renderErrorMessages.bind(this);
  }
  renderErrorMessages(arr) {
    let list = [];
    for ( var i = 0; i < arr.length; i++ ) {
      list.push(<li key={i}>{arr[i]}팀 : 점수지급불가, 본부에 보고할것</li>);
    }
    return list;
  }
  render() {
    return (
      <ul className="error-messages">
        {this.renderErrorMessages( this.props.teams )}
      </ul>
    );
  }
}

class PointInput extends Component {
  constructor(props) {
    super(props);
    this.handleOnInputChange = this.handleOnInputChange.bind(this);
    this.state = {
      point: ''
    }
  }
  handleOnInputChange(e) {
    this.props.onInputChange(this.props.team, e.currentTarget.value);
    this.setState({
      point: e.currentTarget.value
    });
  }
  render() {
    let inputCN = cn({
      'form-control': true,
      'point-input': true,
      'border-red': this.props.hasError ? true : false
    });

    return (
      <InputGroup>
        <InputGroupAddon addonType="prepend">
          <InputGroupText>
            {this.props.team}
          </InputGroupText>
        </InputGroupAddon>
        <input type="number" value={this.state.point} className={inputCN} placeholder={this.props.placeholder} onChange={this.handleOnInputChange}/>
      </InputGroup>
    );
  }

  componentWillReceiveProps(nextProps) {
    // parent에서 setState를 통해 다시 그릴때 여기 state.point 도 초기화 해준다
    // 그래야 placeholder만 보이고 value는 초기화됨
    this.setState({
      point: ''
    });
  }
}

class Point extends Component {
  constructor(props) {
    super(props);

    this.teamPoints = this.makeEmptyTeamPoints(this.props.teamCount);
    this.pointInputFields = [];
    this.renderPointInputs = this.renderPointInputs.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handlePointInputChange = this.handlePointInputChange.bind(this);
    this.makeEmptyTeamPoints = this.makeEmptyTeamPoints.bind(this);

    this.state = {
      errorTeams: [],
      placeholders: [...this.teamPoints]
    };
  }

  handlePointInputChange(team, point) {
    // 일부로 이렇게 했다. 굳이 계속 setState를 하면 계속 다시 그려지니까 비효율적이야 !
    this.teamPoints[team-1].team = team;
    this.teamPoints[team-1].point = point;
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    // timer check
    let config = {
      method: 'POST',
      url: '/admin/timers/get-team-timers',
      data: {
        teamCount: this.props.teamCount
      }
    }
    let response = await utils.simpleAxios(axios, config);
    let teamTimers = response.data;

    // 전체 값이 비어있는지 체크
    let allEmpty = this.teamPoints.filter(obj => {return (Number.isInteger(obj.point) ? true : false)}).length < 1;
    if ( allEmpty ) {
      return alert("포인트를 입력해 주시기 바랍니다");
    }

    var errorTeams = [];
    // 이제 값 추출
    var points = [];
  
    for( var i = 0; i < this.teamPoints.length; i++ ) {
      const point = this.teamPoints[i].point;
      // timer가 켜져있는 팀만 점수 제공
      if ( teamTimers[i].state && point ) {
        points.push({
          team: (i+1),
          temp: point // 무족권 temp에 넣는다리 !
        });
      } 
      // 단순이 타이머가 꺼져있어서 넣는게 아니라, 꺼져있는데 포인트를 줬을때 문제가 되는거지 !
      else if (point > 0) {
        errorTeams.push(i+1);
      }
    }

    this.teamPoints = this.makeEmptyTeamPoints(this.props.teamCount);

    // 성공한것들은 보내야지
    if ( points.length > 0 ) {
      config = {
        method: 'POST',
        url: '/admin/points/reward',
        data: {
          points
        }
      };

      utils.simpleAxios(axios, config).then(() => {
        // 여기서 다시 그려지면서 에러 메세지가 보여지겠지 !
        // 성공과 실패가 섞여있는거야
        const message = (errorTeams.length > 0 ? '타이머문제로 점수를 받지못한 팀이 있습니다' : '성공');
        this.setState({
          errorTeams,
          placeholders: points
        });
        alert(message);
      });
    } 
    // 타이머 문제로 인해 아예 성공한게 없을때
    else {
      this.setState({
        errorTeams,
        placeholders: points
      });
      alert('실패');
    }
  }

  renderPointInputs(teamCount) {
    var inputList = [];

    for( var i = 1; i <= teamCount; i++ ) {
      const placeholder = this.state.placeholders.find(el => {return el.team == i});
      let hasError = this.state.errorTeams.filter(team => {return (team === i)}).length > 0;
      inputList.push(
        <Col xs="6" key={i}>
          <PointInput team={i} hasError={hasError} placeholder={placeholder ? placeholder.temp : ''} onInputChange={this.handlePointInputChange}></PointInput>
        </Col>
      );
    }

    return inputList;
  }

  makeEmptyTeamPoints(teamCount) {
    let teamPoints = [];
    for ( var i = 0; i < teamCount; i++ ) {
      teamPoints.push({
        team: null,
        point: null
      });
    }
    return teamPoints;
  }

  render() {

    if ( ! this.props.teamCount ) {
      return (<NotReady></NotReady>);
    }

    return (
      <div className="point-page full-container">
        <div className="point-page-inner">
          <div className="l-top">
            <h2 className="title">점수 제공</h2>
            <Row>
              { this.renderPointInputs(this.props.teamCount) }
            </Row>
            { this.state.errorTeams.length > 0 ? <ErrorMessages teams={this.state.errorTeams}></ErrorMessages> : '' }
          </div>
          <div className="l-bottom">
            <Button color="primary" block onClick={this.handleFormSubmit}>확인</Button>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    teamCount: state.teamCount
  };
}

export default connect(mapStateToProps, null)(Point);