// utils
import axios from 'axios';
import * as utils from '../../utils/client';

// react & redux
import React, { Component } from 'react';
import ReactRevealText from 'react-reveal-text';

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
    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
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
        alert('성공');
        window.location.href = '/' + response.data.role + ( (response.data.role == 'user' || response.data.role == 'assist') ? '/page/map' : '' );
      });
    } else {
      alert('비밀번호를 입력해 주세요');
    }
  }

  handlePasswordInput(e) {
    let val = e.currentTarget.value;
    this.setState({
      password: val
    });
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