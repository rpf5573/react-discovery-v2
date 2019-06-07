import React from 'react';
import { connect } from 'react-redux';
import * as utils from '../../../../utils/client';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Label, Row, Col, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { closeModal, updateAdminPasswords } from '../../actions';
import axios from 'axios';

class AdminPasswordModal extends React.Component {

  constructor(props) {
    super(props);
    this.passwordInputFields = [];
    this.state = {
      backdrop: true,
    };
    this.close = this.close.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.adminInput = React.createRef();
    this.assistInput = React.createRef();
  }

  close() {
    this.props.closeModal();
  }

  validate(inputs) {
    return 201;
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    if ( !this.adminInput.current.value && !this.assistInput.current.value ) {
      alert("ERROR : 비밀번호를 입력해 주시기 바랍니다");
      return;
    }
    const config = {
      method: 'POST',
      url: '/admin/admin-passwords/passwords',
      data: {
        adminPasswords: {
          admin: (this.adminInput.current.value ? this.adminInput.current.value : this.props.admin),
          assist: (this.assistInput.current.value ? this.assistInput.current.value : this.props.assist )
        }
      }
    };
    utils.simpleAxios(axios, config).then((response) => {
      this.props.updateAdminPasswords(config.data.adminPasswords);
      alert( '성공' );
      if ( this.adminInput.current.value ) {
        this.adminInput.current.placeholder = this.adminInput.current.value;
        this.adminInput.current.value = '';
      }
      if ( this.assistInput.current.value ) {
        this.assistInput.current.placeholder = this.assistInput.current.value;
        this.assistInput.current.value = '';
      }
    });
  }

  handleInput(e) {
  }

  render() {
    return (
      <Modal isOpen={ (this.props.activeModalClassName == this.props.className) ? true : false } toggle={this.close} className={this.props.className} size="sm">
        <form id="form-admin-passwords" onSubmit={this.handleFormSubmit}>
          <ModalHeader toggle={this.close}>
            <span>관리자 비밀번호 설정</span>
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col xs="12">
                <Label>관리자</Label>
                <input className="form-control" placeholder={this.props.admin} ref={this.adminInput}></input>
              </Col>
              <div className="divider--uncolor"></div>
              <Col xs="12">
                <Label>보조관리자</Label>
                <input className="form-control" placeholder={this.props.assist} ref={this.assistInput}></input>
              </Col>
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
    admin: state.adminPasswords.admin,
    assist: state.adminPasswords.assist
  };
}

export default connect(mapStateToProps, { closeModal, updateAdminPasswords })(AdminPasswordModal);