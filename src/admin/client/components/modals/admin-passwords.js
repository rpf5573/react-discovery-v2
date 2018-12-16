import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import _ from 'lodash';
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
    this.superInput = React.createRef();
    this.secondaryInput = React.createRef();
  }

  close() {
    this.props.closeModal();
  }

  validate(inputs) {
    return 201;
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    let response = await axios({
      method: 'POST',
      url: '/admin/admin-passwords/passwords',
      data: {
        adminPasswords: {
          super: this.superInput.current.value,
          secondary: this.secondaryInput.current.value
        }
      }
    });

    if ( response.status == 201 ) {
      alert( '성공' );

      this.superInput.current.placeholder = this.superInput.current.value;
      this.superInput.current.value = '';

      this.secondaryInput.current.placeholder = this.secondaryInput.current.value;
      this.secondaryInput.current.value = '';
    }
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
                <input className="form-control" placeholder={this.props.super} ref={this.superInput}></input>
              </Col>
              <div className="divider--uncolor"></div>
              <Col xs="12">
                <Label>보조관리자</Label>
                <input className="form-control" placeholder={this.props.secondary} ref={this.secondaryInput}></input>
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
    super: state.adminPasswords.super,
    secondary: state.adminPasswords.secondary
  };
}

export default connect(mapStateToProps, { closeModal, updateAdminPasswords })(AdminPasswordModal);