import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import _ from 'lodash';
import { Button, Modal, ModalHeader, ModalBody, Table, ModalFooter, Alert, Input, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { closeModal } from '../../actions';
import 'whatwg-fetch';
import { runInThisContext } from 'vm';

class ResultModal extends React.Component {
  constructor(props) {
    super(props);
    this.pointInputFields = [];
    this.state = {
      backdrop: true,
      rows: []
    };
    this.close = this.close.bind(this);
    this.onOpened = this.onOpened.bind(this);
    this.getResultData = this.getResultData.bind(this);
  }

  close() {
    this.props.closeModal();
  }

  getRows( teamCount ) {
    
  }

  render() {
    return (
      <Modal style={{maxWidth: '1200px'}} isOpen={ (this.props.activeModalClassName == this.props.className) ? true : false } toggle={this.close} className={this.props.className} onOpened={this.onOpened}>
        <ModalHeader toggle={this.close}>
          <span>본부 점수 제공</span>
        </ModalHeader>
        <ModalBody>
          <Table bordered={true}>
            <thead>
              <tr>
                <th rowSpan="2" colSpan="1">TEAM</th>
                <th colSpan="6">활동점수</th>
                <th colSpan="8">평가점수</th>
                <th colSpan="4">결과</th>
              </tr>
              <tr> 
                <th colSpan="2">가용점수</th>
                <th colSpan="2">누적점수</th>
                <th colSpan="2">이동시간</th>

                <th colSpan="2">퍼즐 Open Point</th>
                <th colSpan="2">퍼즐 Open 개수</th>
                <th colSpan="2">보너스 퍼즐 Open</th>
                <th colSpan="2">암호해독</th>

                <th colSpan="2">최종점수</th>
                <th colSpan="2">기여도순위</th>
              </tr>
            </thead>
            <tbody>
              { this.state.rows.map((row, i) => <TableRow obj={row} key={i}></TableRow>) }
            </tbody>
          </Table>
        </ModalBody>
      </Modal>
    );
  }

  async onOpened() {
    await this.getResultData();
  }
  
  async getResultData() {
    let response = await fetch('/admin/result');
    if ( response.status == 201 ) {
      let rows = await response.json();
      this.setState({
        rows
      });
    } else {
      alert( 'ERROR : 최종결과 데이타를 가져오는 중에 에러가 발생하였습니다' );
    }
  }

  async componentDidMount() {
    await this.getResultData();
  }
}

function TableRow(props) {
  return (
    <tr>
      <td colSpan="1">{props.obj.team}</td>
      <td colSpan="2">{props.obj.useable}</td>
      <td colSpan="2">{props.obj.stack}</td>
      <td colSpan="2">{props.obj.timer}</td>
      <td colSpan="2">{props.obj.boxOpenGetEmpty}</td>
      <td colSpan="2">{props.obj.puzzleOpenCount}</td>
      <td colSpan="2">{props.obj.boxOpenGetWord}</td>
      <td colSpan="2">{props.obj.eniac}</td>
      <td colSpan="2">{props.obj.totalPoint}</td>
      <td colSpan="2">{props.obj.rank}</td>
    </tr>
  );
}

function mapStateToProps(state, ownProps) {
  return {
    activeModalClassName: state.modalControl.activeModalClassName,
    teamCount: state.teamSettings.teamCount
  };
}

export default connect(mapStateToProps, { closeModal })(ResultModal);