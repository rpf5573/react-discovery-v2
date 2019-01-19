import * as utils from '../../../../utils/client';
import * as constants from '../../../../utils/constants';
import React from 'react';
import { connect } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, Row, Col, InputGroup, InputGroupAddon, InputGroupText, Label } from 'reactstrap';
import { closeModal, updateTeamTimerState, updateLapTime, updateEniacState } from '../../actions';
import axios from 'axios';
import cn from 'classnames';

class TimerModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      backdrop: true
    }

    this.close = this.close.bind(this);
    this.updateLapTime = this.updateLapTime.bind(this);
    this.handleTimerBtnClick = this.handleTimerBtnClick.bind(this);
    this.allTimerStart = this.allTimerStart.bind(this);
    this.updateEniacState = this.updateEniacState.bind(this);
  }

  close() {
    this.props.closeModal();
  }

  async handleTimerBtnClick(e) {
    let team = parseInt(e.currentTarget.getAttribute('data-team'));
    let state = parseInt(e.currentTarget.getAttribute('data-state'));
    let newState = state ? constants.OFF : constants.ON;
    let actionWord = newState ? constants.START : constants.STOP;

    // 아빠의 요청대로 시작버튼은 작동하지 않도록 했다. 전체시작만 쓴대 !. 하지만 나는 이렇게 임시적으로만 막아놔야지.
    // 혹시 나중에 필요할지도 모르니까 - 2019.01.12
    if ( newState == constants.ON ) {
      return;
    }

    const config = {
      method: 'POST',
      url: '/admin/timers/update-team-timers',
      data: {
        newState, 
        team,
        mappingPoints: {
          timerPlus: this.props.mappingPoints.timerPlus,
          timerMinus: this.props.mappingPoints.timerMinus,
        },
        laptime: this.props.laptime
      }
    };
    utils.simpleAxios(axios, config).then(response => {
      let newTeamTimers = response.data;
      this.props.updateTeamTimerState(newTeamTimers);
      alert( team+'팀의 타이머를 '+actionWord+'하였습니다' );
    });
  }

  async allTimerStart(e) {
    const config = {
      method: 'POST',
      url: '/admin/timers/update-team-timers',
      data: {
        team: 0,
        newState: constants.ON,
        isAll: true
      }
    };

    utils.simpleAxios(axios, config).then(response => {
      let newTeamTimers = response.data;
      this.props.updateTeamTimerState(newTeamTimers);
      alert("전체 타이머를 시작하였습니다");
    });
  }

  async updateLapTime(e) {
    let laptime = parseInt(this.lapTimeInput.value);

    // validation
    if ( laptime <= 0 ) {
      alert("랩타임은 0초 이상이어야 합니다");
      return;
    }

    const config = {
      method: 'POST',
      url: '/admin/timers/laptime',
      data: {
        laptime: laptime
      }
    };

    utils.simpleAxios(axios, config).then(() => {
      this.lapTimeInput.value = '';
      const time = utils.secondToMinute(laptime);
      this.lapTimeInput.placeholder = time;
      this.props.updateLapTime(laptime);
      alert( "성공 : 랩타임이 " + time + "로 설정되었습니다" );
    });
  }

  async updateEniacState(e) {
    let val = parseInt(e.currentTarget.value);

    const config = {
      method: 'POST',
      url: '/admin/timers/eniac-state',
      data: {
        eniacState: val
      }
    };
    utils.simpleAxios(axios, config).then(() => {
      this.props.updateEniacState(val);
      alert("성공");
    });
  }

  renderTimerManageBtns(count) {
    let currentTime = utils.getCurrentTimeInSeconds();
    var btnList = [];
    for ( var i = 1; i <= count; i++ ) {
      let teamTimer = this.props.teamTimers[i-1] // 이게 1팀부터 15팀까지 순서대로 정리되어있으니까,,,그냥 이렇게 찾아도 문제없음
      let color = cn({
        basic: !teamTimer.state,
        danger: teamTimer.state
      });
      let text = teamTimer.state ? constants.STOP : constants.WAIT;
      var restTime = teamTimer.restTime;
      if ( teamTimer.state ) {
        restTime = this.props.laptime - (currentTime - teamTimer.startTime);
      }
      let restTimeCN = cn({
        restTime: true,
        'restTime--minus': (restTime < 0) ? true : false
      });
      let timerAppendBoxCN = cn({
        'd-none': !teamTimer.state
      });
      btnList.push(
        <Col sm="3" key={i}>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                {i}
              </InputGroupText>
            </InputGroupAddon>
            <Button color={color} data-team={i} data-state={teamTimer.state} onClick={this.handleTimerBtnClick}>
              {text}
            </Button>
            <InputGroupAddon addonType="append" className={timerAppendBoxCN}>
              <InputGroupText>
                <div className="rotate-clock">
                  <div className="hour"></div>
                  <div className="minute"></div>
                </div>
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          <div className={restTimeCN}> { teamTimer.state ? ( '남은시간 : ' + utils.secondToMinute(restTime) ) : ( '종료시간 : ' + utils.secondToMinute(restTime) ) } </div>
        </Col>
      );
    }

    return btnList;
  }

  render() {
    return (
      <Modal isOpen={ (this.props.activeModalClassName == this.props.className) ? true : false } toggle={this.close} className={this.props.className} size="lg">
        <ModalHeader toggle={this.close}>
          <div className="l-left">
            타이머
          </div>
          <div className="l-right">
            <div className="l-left d-flex eniac-on-off">
              <span className="mr-3">
                문장해독 : 
              </span>
              <div className="radio abc-radio abc-radio-primary mr-3">
                <input type="radio" id="eniacStateRadioInput01" onChange={this.updateEniacState} checked={ this.props.eniacState ? true : false } value={constants.ON}/>
                <label htmlFor="eniacStateRadioInput01">ON</label>
              </div>
              <div className="radio abc-radio abc-radio-danger">
                <input type="radio" id="eniacStateRadioInput02" onChange={this.updateEniacState} checked={ this.props.eniacState ? false : true } value={constants.OFF}/>
                <label htmlFor="eniacStateRadioInput02">OFF</label>
              </div>
            </div>
            <div className="l-right d-flex align-items-center justify-content-end">
              <Label>랩타임 설정 : </Label>
              <InputGroup>
                <input type="number" className="form-control" placeholder={utils.secondToMinute(this.props.laptime)} ref={input => this.lapTimeInput = input}/>
                <InputGroupAddon addonType="append">
                  <Button color="secondary" onClick={this.updateLapTime}>확인</Button>
                </InputGroupAddon>
              </InputGroup>
            </div>
          </div>
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col xs="12">
              <Button block color="info" onClick={this.allTimerStart}>전체 시작</Button>
            </Col>
          </Row>
          <div className="divider divider--uncolor"></div>
          <Row>
            { this.renderTimerManageBtns(this.props.teamCount) }
          </Row>
        </ModalBody>
      </Modal>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    activeModalClassName : state.modalControl.activeModalClassName,
    laptime: state.timer.laptime,
    teamCount: state.teamSettings.teamCount,
    teamTimers: state.timer.teamTimers,
    mappingPoints: state.mappingPoints,
    eniacState: state.timer.eniacState,
  };
}

export default connect(mapStateToProps, { closeModal, updateTeamTimerState, updateLapTime, updateEniacState })(TimerModal);