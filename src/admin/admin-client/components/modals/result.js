import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import * as utils from '../../../../utils/client';
import * as constants from '../../../../utils/constants';
import { Modal, ModalHeader, ModalBody, Table } from 'reactstrap';
import { closeModal } from '../../actions';
import axios from 'axios';
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

  render() {
    return (
      <Modal style={{maxWidth: '1200px'}} isOpen={ (this.props.activeModalClassName == this.props.className) ? true : false } toggle={this.close} className={this.props.className} onOpened={this.onOpened}>
        <ModalBody>
          <Table bordered={true}>
            <thead>
              <tr>
                <th rowSpan="2" colSpan="1">TEAM</th>
                <th rowSpan="2" colSpan="2">가용점수</th>
                <th colSpan="10">평가점수</th>
                <th colSpan="4">결과</th>
              </tr>
              <tr> 
                <th colSpan="2">이동시간</th>
                <th colSpan="2">구역점유</th>
                <th colSpan="2">구역점유 개수</th>
                <th colSpan="2">글자구역점유 개수</th>
                <th colSpan="2">문장해독</th>

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
    if ( this.props.teamCount > 0 ) {
      const config = {
        method: 'POST',
        url: '/admin/result',
        data: {
          teamCount: this.props.teamCount
        }
      }

      utils.simpleAxios(axios, config, (response) => {
        console.log( 'response : ', response );
        this.setState({
          rows: response.data
        });
      });
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
      <td colSpan="2">{props.obj.timer}</td>
      <td colSpan="2">{props.obj.puzzle}</td>
      <td colSpan="2">{props.obj.puzzleOpenCount}</td>
      <td colSpan="2">{props.obj.wordPuzzleOpenCount}</td>
      <td colSpan="2">{props.obj.eniac}</td>
      <td colSpan="2">{props.obj.totalPoint}</td>
      <td colSpan="2">{props.obj.rank}</td>
    </tr>
  );
}

function mapStateToProps(state, ownProps) {
  return {
    activeModalClassName: state.modalControl.activeModalClassName,
    teamCount: state.teamSettings.teamCount,
  };
}

export default connect(mapStateToProps, { closeModal })(ResultModal);