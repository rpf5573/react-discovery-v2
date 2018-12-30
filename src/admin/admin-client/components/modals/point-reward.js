import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import _ from 'lodash';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Input, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { closeModal } from '../../actions';
import axios from 'axios';

class PointReward extends React.Component {

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
        if ( !isNaN(val) && val > 0 ) { // 0이 들어와도 되기는 한다
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

      try {
        let response = await axios({
          method: 'POST',
          url: '/admin/point-reward/points',
          data: {
            points
          }
        });

        if ( response.status == 201 && !response.data.error ) {
          for( var i = 0; i < this.pointInputFields.length; i++ ) {
            let input = this.pointInputFields[i];
            let val = parseInt(input.value);
            if ( ! isNaN(val) && val > 0 ) {
              input.value = '';
              input.placeholder = val;
            }
          }
          alert( "성공" );
          return;
        } else {
          alert( response.data.error );
          return;
        }
      } catch(error) {
        console.error(error);
      }
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
            <input type="number" min="0" className="form-control point-input" />
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
            <Alert color="danger">
              주의 : 본부에서 점수를 제공해도 바로 지급되지 않습니다. 타이머가 종료되는 순간 지급됩니다.
            </Alert>
            <Row>
              { this.renderPointInputs(this.props.teamCount) }
            </Row>
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

export default connect(mapStateToProps, { closeModal })(PointReward);