// utils
import axios from 'axios';

// react & redux
import React, { Component } from 'react';
import ReactRevealText from 'react-reveal-text';
import { Button, Modal, ModalHeader, ModalBody, Table, ModalFooter, Alert, Input, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, InputGroup, InputGroupAddon, InputGroupText, FormGroup, Label, ButtonGroup } from 'reactstrap';

// css
import 'bootstrap/dist/css/bootstrap.css';
import './scss/style.scss';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      companyImageURL: 'http://unsplash.it/1200x800',
      show: false,
      password: null
    }
    this.handlePasswordInput = this.handlePasswordInput.bind(this);
    this.handleLoginBtnClick = this.handleLoginBtnClick.bind(this);
  }

  handlePasswordInput(e) {
    let val = e.currentTarget.value;
    this.setState({
      password: val
    });
  }

  async handleLoginBtnClick(e) {
    if ( this.state.password ) {
      let response = await axios({
        method: 'POST',
        url: '/entrance/login',
        data: {
          password: this.state.password
        }
      });
      if ( response.status == 201 && !response.data.error ) {
        alert('성공');
        window.location.href = '/' + response.data.role + ( (response.data.role == 'user' || response.data.role == 'assist') ? '/page/map' : '' );
      } else {
        alert( response.data.error );
      }
    } else {
      alert('비밀번호를 입력해 주세요');
    }
  }

  render() {
    return (
      <div className="page">
        <div className="bg-img" style={{ backgroundImage: `url(${this.state.companyImageURL})` }}> </div>
        <div className="page-inner">
          <div className="l-top">
            <div className="text-container">
              <ReactRevealText show={this.state.show}>
                DISCOVERY
              </ReactRevealText>
            </div>
          </div>
          <div className="l-bottom">
            <div className="login-container">
              <Input placeholder="비밀번호" onChange={this.handlePasswordInput}></Input>
              <Button color="primary" block onClick={this.handleLoginBtnClick}>로그인</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  async componentDidMount() {
    let response = await axios('/entrance/companyImage');
    if ( response.status == 201 ) {
      let result = response.data;
      if ( result.companyImage ) {
        this.setState({
          companyImageURL: '/admin/uploads/' + result.companyImage,
          show: true
        });
      }
    }
  }

}

export default App;