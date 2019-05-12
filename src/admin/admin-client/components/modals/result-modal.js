import React from 'react';
import { connect } from 'react-redux';
import * as utils from '../../../../utils/client';
import { Modal, ModalHeader, ModalBody, Table, Alert } from 'reactstrap';
import { closeModal } from '../../actions';
import axios from 'axios';

function TableRow(props) {
  return (
    <tr>
      <td colSpan="1">{props.obj.team}</td>

      <td colSpan="2">{props.obj.useable}</td>
      <td colSpan="2">{props.obj.timer}</td>
      <td colSpan="2">{props.obj.puzzle}</td>
      <td colSpan="2">{props.obj.eniac}</td>
      <td colSpan="2">{props.obj.bingo}</td>

      <td colSpan="2">{props.obj.emptyBoxOpenCount}</td>
      <td colSpan="2">{props.obj.wordBoxOpenCount}</td>
      <td colSpan="2">{props.obj.puzzleBoxOpenRate}%</td>

      <td colSpan="2">{props.obj.totalPoint}</td>
      <td colSpan="2">{props.obj.rank}</td>
    </tr>
  );
}

function TableRowWithoutPuzzleBox(props) {
  return (
    <tr>
      <td colSpan="1">{props.obj.team}</td>

      <td colSpan="2">{props.obj.useable}</td>
      <td colSpan="2">{props.obj.timer}</td>

      <td colSpan="2">{props.obj.totalPoint}</td>
      <td colSpan="2">{props.obj.rank}</td>
    </tr>
  );
} 

class ResultModal extends React.Component {
  constructor(props) {
    super(props);
    this.pointInputFields = [];
    this.state = {
      backdrop: true,
      rows: [],
      error: false
    };
    this.close = this.close.bind(this);
    this.onOpened = this.onOpened.bind(this);
    this.getResultData = this.getResultData.bind(this);
    this.renderResultTable = this.renderResultTable.bind(this);
    this.renderResultTableWithoutPuzzleBox = this.renderResultTableWithoutPuzzleBox.bind(this);
  }

  close() {
    this.props.closeModal();
  }

  renderResultTable() {
    return (
      <Table bordered={true}>
        <thead>
          <tr>
            <th rowSpan="2" colSpan="1">TEAM</th>
            <th colSpan="10">평가점수</th>
            <th colSpan="6">구역점유</th>
            <th colSpan="4">결과</th>
          </tr>
          <tr> 
            <th colSpan="2">가용점수</th>
            <th colSpan="2">이동시간</th>
            <th colSpan="2">구역점유</th>
            <th colSpan="2">문장해독</th>
            <th colSpan="2">구역연결점수</th>

            <th colSpan="2">일반구역</th>
            <th colSpan="2">글자구역</th>
            <th colSpan="2">점유율</th>

            <th colSpan="2">평가점수 합산</th>
            <th colSpan="2">기여도순위</th>
          </tr>
        </thead>
        <tbody>
          { this.state.rows.map((row, i) => <TableRow obj={row} key={i}></TableRow>) }
        </tbody>
      </Table>
    );
  }

  renderResultTableWithoutPuzzleBox() {
    return (
      <Table bordered={true}>
        <thead>
          <tr>
            <th rowSpan="2" colSpan="1">TEAM</th>
            <th colSpan="4">평가점수</th>
            <th colSpan="4">결과</th>
          </tr>
          <tr>
            <th colSpan="2">가용점수</th>
            <th colSpan="2">이동시간</th>

            <th colSpan="2">평가점수 합산</th>
            <th colSpan="2">기여도순위</th>
          </tr>
        </thead>
        <tbody>
          { this.state.rows.map((row, i) => <TableRowWithoutPuzzleBox obj={row} key={i}></TableRowWithoutPuzzleBox>) }
        </tbody>
      </Table>
    );
  }

  render() {
    let pointTable = ( this.props.puzzleBoxCount > 0 ) ? this.renderResultTable() : this.renderResultTableWithoutPuzzleBox();
    return (
      <Modal style={{maxWidth: '1000px'}} isOpen={ (this.props.activeModalClassName == this.props.className) ? true : false } toggle={this.close} className={this.props.className} onOpened={this.onOpened}>
        <ModalBody>
          <ModalHeader toggle={this.close}>
            최종결과표
          </ModalHeader>
          { pointTable }
          { this.state.error ? <Alert color="warning">{this.state.error}</Alert> : '' }
        </ModalBody>
      </Modal>
    );
  }

  async onOpened() {
    await this.getResultData();
  }
  
  async getResultData() {
    if ( this.props.teamCount > 0 ) {
      const config = {
        method: 'POST',
        url: '/admin/result',
        data: {
          teamCount: this.props.teamCount,
          puzzleBoxCount: this.props.puzzleBoxCount
        }
      }
      utils.simpleAxios(axios, config).then((response) => {
        this.setState({
          error: false,
          rows: response.data
        });
      });
    } else {
      this.setState({
        error: '팀설정을 먼저 완료해 주시기 바랍니다'
      });
    }
  }

  async componentDidMount() {
    await this.getResultData();
  }
}

function mapStateToProps(state, ownProps) {
  console.log( 'state : ', state );
  return {
    activeModalClassName: state.modalControl.activeModalClassName,
    teamCount: state.teamSettings.teamCount,
    puzzleBoxCount: state.puzzleSettings.puzzleBoxCount,
  };
}

export default connect(mapStateToProps, { closeModal })(ResultModal);