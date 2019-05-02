// utils
import axios from 'axios';
import * as utils from '../../utils/client';

// react & redux
import React, { Component } from 'react';
import ReactRevealText from 'react-reveal-text';

// React AlertModal
import AlertModal from 'react-modal';

// css
import 'bootstrap/dist/css/bootstrap.css';
import './scss/style.scss';


AlertModal.setAppElement('#app');
AlertModal.defaultStyles.content = {};
AlertModal.defaultStyles.overlay.backgroundColor = '';
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      companyImageURL: 'http://unsplash.it/1200x800',
      show: false,
      password: null,
      alertModal: {
        isOpen: false,
        somethingWrong: false,
        header: '',
        body: '',
        onPositive: false,
        onNegative: false
      }
    }
    this.handlePasswordInput = this.handlePasswordInput.bind(this);
    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    this.openAlertModal = this.openAlertModal.bind(this);
    this.closeAlertModal = this.closeAlertModal.bind(this);
    this.renderAlertModal = this.renderAlertModal.bind(this);
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
      axios.post(config).then((response) => {
        if ( response.status != 201 ) {
          this.openAlertModal(true, 'error', response.data.error, false, this.closeAlertModal);
          return;
        }

        this.openAlertModal(false, false, '성공', ()=>{
          window.location.href = '/' + response.data.role + ( (response.data.role == 'user' || response.data.role == 'assist') ? '/page/map' : '' );
        }, false);

      }).catch((e) => {
        this.openAlertModal(true, 'error', e, false, this.closeAlertModal);
      });
    } else {
      this.openAlertModal(true, 'error', '비밀번호를 입력해주세요', false, this.closeAlertModal);
    }
  }

  handlePasswordInput(e) {
    let val = e.currentTarget.value;
    this.setState({
      password: val
    });
  }

  openAlertModal(somethingWrong=false, header=false, body=false, onPositive=false, onNegative=false) {
    const alertModalState = {
      isOpen: true,
      somethingWrong,
      header,
      body,
      onPositive,
      onNegative
    };
    this.setState({alertModal: alertModalState});
  }

  closeAlertModal() {
    const alertModalState = {...this.state.alertModal};
    alertModalState.isOpen = false;
    this.setState({alertModal: alertModalState});
  }

  renderAlertModal() {
    let header = '';
    if ( this.state.alertModal.header ) {
      const className = this.state.alertModal.somethingWrong ? 'alertModal__header alertModal__header--error' : 'alertModal__header';
      header = <h3 className={className}>{this.state.alertModal.header}</h3>;
    }
    const body = this.state.alertModal.body ? <p>{this.state.alertModal.body}</p> : '';
    const positiveBtn = this.state.alertModal.onPositive ? <button className="alertModal__positiveBtn" onClick={this.state.alertModal.onPositive}>확인</button> : '';
    const negativeBtn = this.state.alertModal.onNegative ? <button className="alertModal__negativeBtn" onClick={this.state.alertModal.onNegative}>취소</button> : '';

    return (
      <AlertModal
        isOpen={this.state.alertModal.isOpen}
        onRequestClose={this.closeAlertModal}>
        <div className="alertModal">
          {header}
          {body}
          <div className="alertModal__btnContainer">
            {positiveBtn}
            {negativeBtn}
          </div>
        </div>
      </AlertModal>
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
        {this.renderAlertModal()}
      </div>
    );
  }

  async componentDidMount() {
    utils.simpleAxios(axios, '/entrance/companyImage', false).then(response => {
      if ( response.data.error ) {
        this.openAlertModal(false, response.data.error, false, ()=>{ this.closeAlertModal() });
        return;
      }
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