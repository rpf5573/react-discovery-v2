import * as utils from '../../../../utils/client';
import * as constants from '../../../../utils/constants';
import React from 'react';
import { connect } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Input, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, InputGroup, InputGroupAddon, InputGroupText, FormGroup, Label, ButtonGroup } from 'reactstrap';
import { closeModal, updateTeamTimerState, updateLapTime } from '../../actions';
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
  }

  close() {
    this.props.closeModal();
  }

  async handleTimerBtnClick(e) {
    let team = parseInt(e.currentTarget.getAttribute('data-team'));
    let state = parseInt(e.currentTarget.getAttribute('data-state'));
    let newState = state ? constants.OFF : constants.ON;
    let actionWord = newState ? constants.START : constants.STOP;

    const config = {
      method: 'POST',
      url: '/admin/timer/team-timers',
      data: {
        newState, 
        team,
        mappingPoints: {
          timer_plus: this.props.mappingPoints.timer_plus,
          timer_minus: this.props.mappingPoints.timer_minus,
        },
        laptime: this.props.laptime
      }
    };
    utils.simpleAxios(axios, config, (response) => {
      let newTeamTimers = response.data;
      this.props.updateTeamTimerState(newTeamTimers);
      alert( team+'팀의 타이머를 '+actionWord+'하였습니다' );
    });
  }

  async allTimerStart(e) {
    const config = {
      method: 'POST',
      url: '/admin/timer/team-timers',
      data: {
        team: 0,
        newState: constants.ON,
        isAll: true
      }
    };

    utils.simpleAxios(axios, config, (response) => {
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
      url: '/admin/timer/laptime',
      data: {
        laptime: laptime
      }
    };

    utils.simpleAxios(axios, config, (response) => {
      this.lapTimeInput.value = '';
      const time = utils.secondToMinute(laptime);
      this.lapTimeInput.placeholder = time;
      this.props.updateLapTime(laptime);
      alert( "성공 : 랩타임이 " + time + "로 설정되었습니다" );
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
      let text = teamTimer.state ? constants.STOP : constants.START;
      let restTimeBox = false;
      if ( teamTimer.state ) {
        let restTime = this.props.laptime - (currentTime - teamTimer.startTime);
        let restTimeCN = cn({
          restTime: true,
          'restTime--minus': (restTime < 0) ? true : false
        });
        restTimeBox = (<div className={restTimeCN}> 남은시간 : { utils.secondToMinute(restTime) } </div>);
      }
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
                <div class="rotate-clock">
                  <div class="hour"></div>
                  <div class="minute"></div>
                </div>
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          {restTimeBox}
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
            <Label>랩타임 설정 : </Label>
            <InputGroup>
              <input type="number" className="form-control" placeholder={utils.secondToMinute(this.props.laptime)} ref={input => this.lapTimeInput = input}/>
              <InputGroupAddon addonType="append">
                <Button color="secondary" onClick={this.updateLapTime}>확인</Button>
              </InputGroupAddon>
            </InputGroup>
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
    mappingPoints: state.mappingPoints
  };
}

export default connect(mapStateToProps, { closeModal, updateTeamTimerState, updateLapTime })(TimerModal);