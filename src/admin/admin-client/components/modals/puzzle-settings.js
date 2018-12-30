import * as utils from '../../../../utils';
import * as constants from '../../../../utils/constants';
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import _ from 'lodash';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Input, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, InputGroup, InputGroupAddon, InputGroupText, FormGroup, Label, Dropdown, DropdownToggle, DropdownItem, DropdownMenu, Table } from 'reactstrap';
import { closeModal, updatePuzzleBoxCount, updateEniacWords, updateLastBoxGoogleDriveUrl, updateLastBoxState, updateEniacState } from '../../actions';
import axios from 'axios';
import 'awesome-bootstrap-checkbox';

class PuzzleSettings extends React.Component {

  constructor(props) {
    super(props);

    this.passwordInputFields = [];
    this.state = {
      backdrop: true,
      btnDropright: false,
    };
    this.close = this.close.bind(this);
    this.updatePuzzleBoxCount = this.updatePuzzleBoxCount.bind(this);
    this.renderPuzzleBoxCountDropdownMenuItems = this.renderPuzzleBoxCountDropdownMenuItems.bind(this);
    this.updateEniacWords = this.updateEniacWords.bind(this);
    this.eniacWordInput = React.createRef();

    this.lastBoxGoogleDriveUrlInput = React.createRef();
    this.updateLastBoxGoogleDriveUrl = this.updateLastBoxGoogleDriveUrl.bind(this);

    this.updateEniacState = this.updateEniacState.bind(this);
    this.updateLastBoxState = this.updateLastBoxState.bind(this);
  }

  close() {
    this.props.closeModal();
  }

  async updatePuzzleBoxCount(e) {
    const count = parseInt(e.currentTarget.getAttribute('data-count'));

    try {
      let response = await axios({
        method: 'POST',
        url: '/admin/puzzle-settings/puzzlebox-count',
        data: {
          puzzleBoxCount: count
        }
      });

      if ( response.status == 201 ) {
        if ( response.data.error ) {
          console.error( response.data.error );
          return alert( response.data.error );
        }

        alert( "성공" );

        this.eniacWordInput.current.value = '';
        this.eniacWordInput.current.placeholder = '';
        this.props.updatePuzzleBoxCount(count);
      } else {
        alert( constants.ERROR.unknown );
      }
    } catch(e) {
      console.error(e);
      alert( constants.ERROR.unknown );
    }
  }

  async updateEniacWords() {
    const val = this.eniacWordInput.current.value;
    if ( val.length > 0 ) {
      var arr = val.replace(/\s/g, "").split('');

      let zeroArr = new Array(this.props.puzzleBoxCount - arr.length).fill(0);
      let resultArr = [...zeroArr, ...arr];
      utils.shuffle(resultArr);
      let json = JSON.stringify(resultArr);

      // 참고로 : puzzleBoxCount가 이미 last box를 고려해서 1개 빼져있는 상태임
      if ( this.props.puzzleBoxCount < resultArr.length ) {
        return alert("ERROR : 글자개수가 박스개수보다 더 많습니다");
      }

      try {
        let response = await axios({
          method: 'POST',
          url: '/admin/puzzle-settings/eniac-words',
          data: {
            originalEniacWords: val,
            randomEniacWords: json
          }
        });

        if ( response.status == 201 ) {
          if ( response.data.error ) {
            console.error( response.data.error );
            return alert( response.data.error );
          }
          this.props.updateEniacWords(val);
          alert("성공");
          this.eniacWordInput.current.value = '';
          this.eniacWordInput.current.placeholder = val;
        } else {
          alert( constants.ERROR.unknown );
        }
      } catch(e) {
        console.error(e);
        alert( constants.ERROR.unknown );
      }
    }
  }

  async updateLastBoxGoogleDriveUrl() {
    let url = this.lastBoxGoogleDriveUrlInput.current.value;
    if ( ! isValidURL(url) ) {
      alert( "ERROR : 입력한 구글드라이브 주소를 다시한번 확인해 주세요" );
      return;
    }

    try {
      let response = await axios({
        method: 'POST',
        url: '/admin/puzzle-settings/lastbox-google-drive-url',
        data: {
          lastBoxGoogleDriveUrl: encodeURI(url)
        }
      });

      if ( response.status == 201 ) {
        if ( response.data.error ) {
          return alert( response.data.error );
        }
        this.props.updateLastBoxGoogleDriveUrl(url);
        alert("성공");
        this.lastBoxGoogleDriveUrlInput.current.value = '';
        this.lastBoxGoogleDriveUrlInput.current.placeholder = val;
      } else {
        alert( constants.ERROR.unknown );
      }
    } catch(e) {
      console.error(e);
      alert( constants.ERROR.unknown );
    }
    
  }

  async updateLastBoxState(e) {
    let val = parseInt(e.currentTarget.value);

    try {
      let response = await axios({
        method: 'POST',
        url: '/admin/puzzle-settings/lastbox-state',
        data: {
          lastBoxState: val
        }
      });

      if ( response.status == 201 ) {
        if ( response.data.error ) {
          return alert( response.data.error );
        }
        this.props.updateLastBoxState(val);
        alert("성공");
      } else {
        alert( constants.ERROR.unknown );
      }
    } catch(e) {
      console.error(e);
      alert( constants.ERROR.unknown );
    }
  }

  async updateEniacState(e) {
    let val = parseInt(e.currentTarget.value);

    try {
      let response = await axios({
        method: 'POST',
        url: '/admin/puzzle-settings/eniac-state',
        data: {
          eniacState: val
        }
      });

      if ( response.status == 201 ) {
        if ( response.data.error ) {
          return alert( response.data.error );
        }
        this.props.updateEniacState(val);
        alert("성공");
      } else {
        alert( constants.ERROR.unknown );
      }
    } catch(e) {
      console.error(e);
      alert( constants.ERROR.unknown );
    }
  }

  renderPuzzleBoxCountDropdownMenuItems() {
    let counts = [20, 24, 30, 35, 40, 48];
    var list = [];
    for ( var i = 0; i < counts.length; i++ ) {
      let isActive = (this.props.puzzleBoxCount == counts[i]) ? true : false;
      list.push(
        <DropdownItem active={isActive} key={i} data-count={counts[i] - 1} onClick={this.updatePuzzleBoxCount}>{counts[i]}개</DropdownItem>
      );
    }
    return list;
  }

  render() {
    return (
      <Modal isOpen={ (this.props.activeModalClassName == this.props.className) ? true : false } toggle={this.close} className={this.props.className} size="lg">
        <ModalHeader toggle={this.close}>
          <span>퍼즐 설정</span>
        </ModalHeader>
        <ModalBody>
          <Alert color="danger">
            주의 : 퍼즐박스개수 변경시 숨겨진 글자도 초기화 됩니다.
          </Alert>
          <Row>
            <Col xs="12">
              <Label>퍼즐 박스 설정</Label>
            </Col>
            <Col xs="12" className={"d-flex justify-content-between"}>
              <div className="l-left">
                <Dropdown direction="right" isOpen={this.state.btnDropright} toggle={() => { this.setState({ btnDropright: !this.state.btnDropright }); }}>
                  <DropdownToggle color="success" caret>
                    {this.props.puzzleBoxCount + 1}개
                  </DropdownToggle>
                  <DropdownMenu>
                    {this.renderPuzzleBoxCountDropdownMenuItems()}
                  </DropdownMenu>
                </Dropdown>
              </div>
              <div className="l-right d-flex w-75 justify-content-end">
                <div className="l-left d-flex col-xs-2 align-self-center">
                  <span className="pr-2">숨겨진 글자 : </span>
                </div>
                <div className="l-right d-flex flex-grow-1 justify-content-end">
                  <input className={"form-control"} placeholder={this.props.eniacWords} ref={this.eniacWordInput}></input>
                  <Button className="ml-2" color="primary" onClick={this.updateEniacWords}>확인</Button>
                </div>
              </div>
            </Col>
          </Row>
          <div className="divider--uncolor"></div>
          <Row>
            <Col xs="12">
              <Label>최종박스 동영상 구글드라이브 주소</Label>
            </Col>
            <Col xs="12">
              <InputGroup>
                <input className={"form-control"} placeholder={this.props.lastBoxGoogleDriveUrl} ref={this.lastBoxGoogleDriveUrlInput}></input>
                <Button color="primary" className={"ml-2"} onClick={this.updateLastBoxGoogleDriveUrl}>확인</Button>
              </InputGroup>
            </Col>
          </Row>
          <div className="divider--uncolor"></div>
          <Row>
            <Col xs="6">
              <div className="d-flex">
                <span className="mr-3">
                  최종 박스 : 
                </span>
                <div className="radio abc-radio abc-radio-primary mr-3">
                  <input type="radio" id="lastBoxStateRadioInput01" onChange={this.updateLastBoxState} checked={ this.props.lastBoxState ? true : false } value={constants.ON}/>
                  <label htmlFor="lastBoxStateRadioInput01">공개</label>
                </div>
                <div className="radio abc-radio abc-radio-danger">
                  <input type="radio" id="lastBoxStateRadioInput02" onChange={this.updateLastBoxState} checked={ this.props.lastBoxState ? false : true } value={constants.OFF}/>
                  <label htmlFor="lastBoxStateRadioInput02">비공개</label>
                </div>
              </div>
            </Col>
            <Col xs="6">
              <div className="d-flex">
                <span className="mr-3">
                  암호해독 : 
                </span>
                <div className="radio abc-radio abc-radio-primary mr-3">
                  <input type="radio" id="eniacStateRadioInput01" onChange={this.updateEniacState} checked={ this.props.eniacState ? true : false } value={constants.ON}/>
                  <label htmlFor="eniacStateRadioInput01">ON</label>
                </div>
                <div className="radio abc-radio abc-radio-danger">
                  <input type="radio" id="eniacStateRadioInput02" onChange={this.updateEniacState} checked={ this.props.eniacState ? false : true } value={constants.OFF}/>
                  <label htmlFor="eniacStateRadioInput02">OFF</label>
                </div>
              </div>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    activeModalClassName: state.modalControl.activeModalClassName,
    puzzleBoxCount: state.puzzleSettings.puzzleBoxCount,
    eniacWords: state.puzzleSettings.eniacWords,
    eniacState: state.puzzleSettings.eniacState,
    lastBoxGoogleDriveUrl: state.puzzleSettings.lastBoxGoogleDriveUrl,
    lastBoxState: state.puzzleSettings.lastBoxState
  };
}

export default connect(mapStateToProps, { closeModal, updatePuzzleBoxCount, updateEniacWords, updateEniacState, updateLastBoxGoogleDriveUrl, updateLastBoxState })(PuzzleSettings);