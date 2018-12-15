import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import _ from 'lodash';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Input, Label, TabPane, Nav, NavItem, NavLink, Row, Col, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { closeModal } from '../../actions';
import 'whatwg-fetch';

class ResetModal extends React.Component {

  constructor(props) {
    super(props);
    this.pointInputFields = [];
    this.state = {
      backdrop: true,
      isResetReady: false
    };
    this.close = this.close.bind(this);
    this.handleResetInput = this.handleResetInput.bind(this);
    this.handleResetBtn = this.handleResetBtn.bind(this);
  }

  close() {
    this.props.closeModal();
  }

  handleResetInput(e) {
    let val = e.currentTarget.value;
    if ( val == 'reset' ) {
      this.setState({
        isResetReady: true
      });
    } else {
      this.setState({
        isResetReady: false
      });
    }
  }

  async handleResetBtn(e) {
    if ( this.state.isResetReady ) {
      let response = await fetch('/admin/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reset_password: 'discovery_reset'
        })
      });
      if ( response.status == 201 ) {
        alert( "성공 !" );
        window.location.reload(); // refresh
      } else {
        alert( 'ERROR : 최종결과 데이타를 가져오는 중에 에러가 발생하였습니다' );
      }
    } else {
      alert( "ERROR : 다시 확인해 주세요" );
    }
  }

  render() {
    return (
      <Modal isOpen={ (this.props.activeModalClassName == this.props.className) ? true : false } toggle={this.close} className={this.props.className} size="sm">
        <ModalHeader toggle={this.close}>
          <span>초기화</span>
        </ModalHeader>
        <ModalBody>
          <Alert color="warning">
            점수 배정표와 관리자 비밀번호는 초기화 되지 않습니다
          </Alert>
          <Row>
            <Col>
              <Label>
                아래에 reset을 입력하세요
              </Label>
              <Input placeholder="reset" onChange={this.handleResetInput}></Input>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.handleResetBtn}>확인</Button>
          <Button color="secondary" onClick={this.close}>취소</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    activeModalClassName : state.modalControl.activeModalClassName,
  };
}

export default connect(mapStateToProps, { closeModal })(ResetModal);