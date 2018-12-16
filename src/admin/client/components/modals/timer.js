import { ON, OFF, START, STOP, getCurrentTimeInSeconds, secondToMinute } from '../../utils';
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
    let newState = state ? OFF : ON;
    let actionWord = newState ? START : STOP;

    let response = await axios({
      method: 'POST',
      url: '/admin/timer/team-timers',
      data: {
        newState, team
      }
    });

    if ( response.status == 201 ) {
      let newTeamTimers = response.data;
      this.props.updateTeamTimerState(newTeamTimers);
      alert( team+'팀의 타이머를 '+actionWord+'하였습니다' );
    }
  }

  async allTimerStart(e) {
    let response = await axios({
      method: 'POST',
      url: '/admin/timer/team-timers',
      data: {
        team: 0,
        newState: ON,
        isAll: true
      }
    });

    if ( response.status == 201 ) {
      let newTeamTimers = response.data;
      this.props.updateTeamTimerState(newTeamTimers);
      alert("전체 타이머를 시작하였습니다");
    } else {
      alert("ERROR : 알수없는 에러가 발생하였습니다");
    }

  }

  async updateLapTime(e) {
    let laptime = parseInt(this.lapTimeInput.value);

    // validation
    if ( laptime <= 0 ) {
      alert("랩타임은 0초 이상이어야 합니다");
      return;
    }

    let response = await axios({
      method: 'POST',
      url: '/admin/timer/laptime',
      data: {
        laptime: laptime
      }
    });

    if ( response.status == 201 ) {
      this.lapTimeInput.value = '';
      this.lapTimeInput.placeholder = secondToMinute(laptime);
      this.props.updateLapTime(laptime);
      alert( "성공" );
    }
  }

  renderTimerManageBtns(count) {
    let currentTime = getCurrentTimeInSeconds();
    var btnList = [];
    for ( var i = 1; i <= count; i++ ) {
      let teamTimer = this.props.teamTimers[i-1] // 이게 1팀부터 15팀까지 순서대로 정리되어있으니까,,,그냥 이렇게 찾아도 문제없음
      let color = cn({
        basic: !teamTimer.state,
        danger: teamTimer.state
      });
      let text = teamTimer.state ? STOP : START;
      let restTimeBox = '';
      if ( teamTimer.state ) {
        let restTime = this.props.laptime - (currentTime - teamTimer.startTime);
        let restTimeCN = cn({
          restTime: true,
          'restTime--minus': (restTime < 0) ? true : false
        });
        restTimeBox = (<div className={restTimeCN}> { secondToMinute(restTime) } </div>);
      }
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
              <input type="number" className="form-control" placeholder={secondToMinute(this.props.laptime)} ref={input => this.lapTimeInput = input}/>
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
    teamTimers: state.timer.teamTimers
  };
}

export default connect(mapStateToProps, { closeModal, updateTeamTimerState, updateLapTime })(TimerModal);