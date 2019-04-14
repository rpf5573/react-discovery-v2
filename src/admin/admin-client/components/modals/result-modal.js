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
      <td colSpan="1">{props.obj.totalPoint}</td>
      <td colSpan="1">{props.obj.rank}</td>
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
  }

  close() {
    this.props.closeModal();
  }

  render() {
    return (
      <Modal style={{maxWidth: '1000px'}} isOpen={ (this.props.activeModalClassName == this.props.className) ? true : false } toggle={this.close} className={this.props.className} onOpened={this.onOpened}>
        <ModalBody>
          <ModalHeader toggle={this.close}>
            최종결과표
          </ModalHeader>
          <Table bordered={true}>
            <thead>
              <tr>
                <th colSpan="1">TEAM</th>
                <th colSpan="1">평가점수 합산</th>
                <th colSpan="1">기여도순위</th>
              </tr>
            </thead>
            <tbody>
              { this.state.rows.map((row, i) => <TableRow obj={row} key={i}></TableRow>) }
            </tbody>
          </Table>
          { this.state.error ? <Alert color="warning">{this.state.error}</Alert> : '' }
        </ModalBody>
      </Modal>
    );
  }

  async onOpened() {
    await this.getResultData();
  }
  
  async getResultData() {
    if ( this.props.teamCount > 0 && this.props.puzzleBoxCount > 0 ) {
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
        error: '팀설정과 구역설정을 먼저 완료해 주시기 바랍니다'
      });
    }
  }

  async componentDidMount() {
    await this.getResultData();
  }
}

function mapStateToProps(state, ownProps) {
  return {
    activeModalClassName: state.modalControl.activeModalClassName,
    teamCount: state.teamSettings.teamCount,
    puzzleBoxCount: state.puzzleSettings.puzzleBoxCount,
  };
}

export default connect(mapStateToProps, { closeModal })(ResultModal);