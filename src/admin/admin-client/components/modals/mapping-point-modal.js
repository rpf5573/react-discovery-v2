import * as utils from '../../../../utils/client';
import React from 'react';
import { connect } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, Table, Alert } from 'reactstrap';
import { closeModal, updateMappingPoints } from '../../actions';
import axios from 'axios';
import cn from 'classnames';

class PointPart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      point: this.props.point
    }

    this.pointInput = React.createRef();

    this.handleEditBtnClick = this.handleEditBtnClick.bind(this);
    this.handleCancelBtnClick = this.handleCancelBtnClick.bind(this);
    this.handleApplyBtnClick = this.handleApplyBtnClick.bind(this);
  }

  handleEditBtnClick(e) {
    this.setState({
      isEditing: true
    });
  }

  handleCancelBtnClick(e) {
    this.setState({
      isEditing: false
    });
    this.pointInput.current.value = null;
  }

  async handleApplyBtnClick(e) {
    let point = this.pointInput.current.value;
    if ( !point ) {
      alert( "ERROR : 포인트를 설정해 주시기 바랍니다" );
      return;
    }
    let mapping_point = {
      [this.props.mapping_key]: parseInt(point)
    }

    const config = {
      method: 'POST',
      url: '/admin/mapping-points/',
      data: {
        mapping_point
      }
    };
    utils.simpleAxios(axios, config).then((response) => {
      alert("성공");
      this.setState({
        isEditing: false,
        point: point
      });
      this.props.onPointUpdate( mapping_point );
      this.pointInput.current.value = null;
    });
  }

  render() {
    let pointInputCN = cn({
      'form-control': true,
      'w-25': true,
      'd-block': this.state.isEditing,
      'd-none': !this.state.isEditing
    });

    let pointAndEditBtnCN = cn({
      'ml-2': true,
      'd-block': !this.state.isEditing,
      'd-none': this.state.isEditing
    });

    let cancelAndApplyBtnCN = cn({
      'ml-2': true,
      'd-block': this.state.isEditing,
      'd-none': !this.state.isEditing
    });
    return (
      <div className="d-flex justify-content-center align-items-center">
        <input className={pointInputCN} type="number" ref={this.pointInput}></input>
        <div className={pointAndEditBtnCN}>
          <span>{this.state.point}</span>
          <Button className="ml-3" outline color="success" size="sm" onClick={this.handleEditBtnClick}>수정</Button>
        </div>
        <div className={cancelAndApplyBtnCN}>
          <Button outline color="secondary" size="sm" onClick={this.handleCancelBtnClick}>취소</Button>
          <Button className="ml-2" outline color="primary" size="sm" onClick={this.handleApplyBtnClick}>적용</Button>
        </div>
      </div>
    );
  }
}

class MappingPointModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      backdrop: true
    }
    this.close = this.close.bind(this);
  }

  close() {
    this.props.closeModal();
  }

  render() {
    return (
      <Modal isOpen={ (this.props.activeModalClassName == this.props.className) ? true : false } toggle={this.close} className={this.props.className} size="lg">
        <ModalHeader toggle={this.close}>
          점수배정표
        </ModalHeader>
        <ModalBody>
          <Table>
            <thead>
              <tr>
                <th>항목</th>
                <th>점수</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>시간점수 +30초</td>
                <td>
                  <PointPart mapping_key="timerPlus" point={this.props.mappingPoints.timerPlus} onPointUpdate={this.props.updateMappingPoints}></PointPart>
                </td>
              </tr>
              <tr>
                <td>시간점수 -30초</td>
                <td>
                  <PointPart mapping_key="timerMinus" point={this.props.mappingPoints.timerMinus} onPointUpdate={this.props.updateMappingPoints}></PointPart>
                </td>
              </tr>
              <tr>
                <td>업로드</td>
                <td>
                  <PointPart mapping_key="upload" point={this.props.mappingPoints.upload} onPointUpdate={this.props.updateMappingPoints}></PointPart>
                </td>
              </tr>
              <tr>
                <td>구역오픈시 필요한 점수</td>
                <td>
                  <PointPart mapping_key="boxOpenUse" point={this.props.mappingPoints.boxOpenUse} onPointUpdate={this.props.updateMappingPoints}></PointPart>
                </td>
              </tr>
              <tr>
                <td>글자 없는 구역</td>
                <td>
                  <PointPart mapping_key="boxOpenGetEmpty" point={this.props.mappingPoints.boxOpenGetEmpty} onPointUpdate={this.props.updateMappingPoints}></PointPart>
                </td>
              </tr>
              <tr>
                <td>글자 있는 구역</td>
                <td>
                  <PointPart mapping_key="boxOpenGetWord" point={this.props.mappingPoints.boxOpenGetWord} onPointUpdate={this.props.updateMappingPoints}></PointPart>
                </td>
              </tr>
              <tr>
                <td>구역연결 점수</td>
                <td>
                  <PointPart mapping_key="bingo" point={this.props.mappingPoints.bingo} onPointUpdate={this.props.updateMappingPoints}></PointPart>
                </td>
              </tr>
              <tr>
                <td>문장해독 점수</td>
                <td>
                  <PointPart mapping_key="eniac" point={this.props.mappingPoints.eniac} onPointUpdate={this.props.updateMappingPoints}></PointPart>
                </td>
              </tr>
            </tbody>
          </Table>
          <Alert color="info"> 문장해독 점수 1등: 20000(기본점수), 2등: 16000, 3등: 13000, 4등: 11000, 5등: 10000, 6등: 9000, 7등: 9000...(동일) </Alert>
        </ModalBody>
      </Modal>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    activeModalClassName: state.modalControl.activeModalClassName,
    mappingPoints: state.mappingPoints
  };
}

export default connect(mapStateToProps, { closeModal, updateMappingPoints })(MappingPointModal);