import React from 'react';
import { connect } from 'react-redux';
import * as utils from '../../../../utils/client';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Row, Col, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { closeModal } from '../../actions';
import axios from 'axios';

class PointRewardModal extends React.Component {

  constructor(props) {
    super(props);
    this.pointInputFields = [];
    this.state = {
      activeTab: '1',
      backdrop: true,
    };
    this.close = this.close.bind(this);
    this.renderPointInputs = this.renderPointInputs.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  close() {
    this.props.closeModal();
  }

  validate(inputs) {
    return 201;
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    this.pointInputFields = [...document.getElementsByClassName("point-input")]; // HTMLCollection to Array
    if ( this.pointInputFields.length > 0 ) {

      var allEmpty = true;
      // 이제 값 추출
      var points = [];
      for( var i = 0; i < this.pointInputFields.length; i++ ) {
        let val = parseInt(this.pointInputFields[i].value);
        if ( !isNaN(val) && (Number.isInteger(val)) ) { // 0이 들어와도 되기는 한다
          allEmpty = false;
          points.push({
            team: (i+1),
            useable: val
          });
        }
      }

      if ( allEmpty ) {
        return alert("포인트를 입력해 주시기 바랍니다");
      }

      const config = {
        method: 'POST',
        url: '/admin/points/reward',
        data: {
          points
        }
      };
      utils.simpleAxios(axios, config).then((response) => {
        for( var i = 0; i < this.pointInputFields.length; i++ ) {
          let input = this.pointInputFields[i];
          let val = parseInt(input.value);
          if ( ! isNaN(val) && (Number.isInteger(val)) ) {
            input.value = '';
            input.placeholder = val;
          }
        }
        alert( "성공" );
      });
    }
  }

  renderPointInputs(teamCount) {
    var inputList = [];
    for( var i = 1; i <= teamCount; i++ ) {
      inputList.push(
        <Col sm="3" key={i}>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                {i}
              </InputGroupText>
            </InputGroupAddon>
            <input type="number" className="form-control point-input" />
          </InputGroup>
        </Col>
      );
    }

    return inputList;
  }

  render() {
    return (
      <Modal isOpen={ (this.props.activeModalClassName == this.props.className) ? true : false } toggle={this.close} className={this.props.className} size="lg">
        <form id="form-points" onSubmit={this.handleFormSubmit}>
          <ModalHeader toggle={this.close}>
            <span>본부 점수 제공</span>
          </ModalHeader>
          <ModalBody>
            <Row>
              { this.renderPointInputs(this.props.teamCount) }
            </Row>
            { ! this.props.teamCount ? <Alert color="warning"> 팀설정을 먼저 해주시기 바랍니다 </Alert> : '' }
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit">적용</Button>
            <Button color="secondary" onClick={this.close}>취소</Button>
          </ModalFooter>
        </form>
      </Modal>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    activeModalClassName : state.modalControl.activeModalClassName,
    teamCount: state.teamSettings.teamCount,
  };
}

export default connect(mapStateToProps, { closeModal })(PointRewardModal);