// utils
import axios from 'axios';
import * as utils from '../../utils/client';

// react & redux
import React, { Component } from 'react';
import ReactRevealText from 'react-reveal-text';

// React Modal
import Modal from 'react-modal';

// css
import 'bootstrap/dist/css/bootstrap.css';
import './scss/style.scss';


Modal.setAppElement('#app');
Modal.defaultStyles.content = {};
Modal.defaultStyles.overlay.backgroundColor = '';
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      companyImageURL: 'http://unsplash.it/1200x800',
      show: false,
      password: null,
      modal: {
        isOpen: false,
        header: '',
        body: '',
        onPositive: false,
        onNegative: false
      }
    }
    this.handlePasswordInput = this.handlePasswordInput.bind(this);
    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.renderModal = this.renderModal.bind(this);
  }

  async handleLoginSubmit(e) {
    e.preventDefault();
    if ( this.state.password ) {
      const config = {
        method: 'POST',
        url: '/entrance/login',
        data: {
          password: this.state.password
        }
      };
      utils.simpleAxios(axios, config).then(response => {
        this.openModal(false, '성공', ()=>{
          window.location.href = '/' + response.data.role + ( (response.data.role == 'user' || response.data.role == 'assist') ? '/page/map' : '' );
        }, false);
      }).catch((e) => {
        this.openModal(false, e, false, ()=>{
          this.closeModal();
        });
      });
    } else {
      this.openModal(false, '비밀번호를 입력해주세요', false, ()=>{
        this.closeModal();
      });
    }
  }

  handlePasswordInput(e) {
    let val = e.currentTarget.value;
    this.setState({
      password: val
    });
  }

  openModal(header=false, body=false, onPositive=false, onNegative=false) {
    const modalState = {
      isOpen: true,
      header,
      body,
      onPositive,
      onNegative
    };
    this.setState({modal: modalState});
  }

  closeModal() {
    const modalState = {...this.state.modal};
    modalState.isOpen = false;
    this.setState({modal: modalState});
  }

  renderModal() {
    const header = this.state.modal.header ? <h3>{this.state.modal.header}</h3> : '';
    const body = this.state.modal.body ? <p>{this.state.modal.body}</p> : '';
    const positiveBtn = this.state.modal.onPositive ? <button class="alertModal__positiveBtn" onClick={this.state.modal.onPositive}>확인</button> : '';
    const negativeBtn = this.state.modal.onNegative ? <button class="alertModal__negativeBtn" onClick={this.state.modal.onNegative}>취소</button> : '';

    return (
      <Modal
        isOpen={this.state.modal.isOpen}
        onRequestClose={this.closeModal}>
        <div className="alertModal">
          {header}
          {body}
          <div className="alertModal__btnContainer">
            {positiveBtn}
            {negativeBtn}
          </div>
        </div>
      </Modal>
    );
  }

  render() {
    return (
      <div className="page">
        <div className="bg-img" style={{ backgroundImage: `url(${this.state.companyImageURL})` }}> </div>
        <div className="page-inner">
          <div className="l-top">
            <div className="text-container">
              <ReactRevealText transitionTime={2000} show={this.state.show}>
                DISCOVERY
              </ReactRevealText>
            </div>
          </div>
          <div className="l-bottom">
            <form className="login-container" onSubmit={this.handleLoginSubmit}>
              <input className="form-control" placeholder="비밀번호" onChange={this.handlePasswordInput}></input>
              <button type="submit" className="btn btn-primary btn-block">로그인</button>
            </form>
          </div>
        </div>
        {this.renderModal()}
      </div>
    );
  }

  async componentDidMount() {
    utils.simpleAxios(axios, '/entrance/companyImage').then(response => {
      let result = response.data;
      if ( result.companyImage ) {
        this.setState({
          companyImageURL: '/admin/uploads/' + window.__dcv__ + '/' + result.companyImage,
          show: true
        });
      } 
      // 못다운 받아도, 글자는 애니메이션 해야징 !
      else {
        this.setState({
          show: true
        });
      }
    });
  }

}

export default App;