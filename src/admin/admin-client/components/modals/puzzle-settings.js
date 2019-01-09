import * as utils from '../../../../utils/client';
import * as constants from '../../../../utils/constants';
import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import { Button, Modal, ModalHeader, ModalBody, Alert, Row, Col, InputGroup, Label, Dropdown, DropdownToggle, DropdownItem, DropdownMenu, Table } from 'reactstrap';
import { closeModal, updatePuzzleBoxCount, updateEniacWords, updateRandomEniacWords, updateLastBoxGoogleDriveUrl, updateLastBoxState } from '../../actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
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

    this.updateLastBoxState = this.updateLastBoxState.bind(this);
  }

  close() {
    this.props.closeModal();
  }

  async updatePuzzleBoxCount(e) {
    const count = parseInt(e.currentTarget.getAttribute('data-count'));
    const config = {
      method: 'POST',
      url: '/admin/puzzle-settings/puzzlebox-count',
      data: {
        puzzleBoxCount: count
      }
    };
    let response = await utils.simpleAxios(axios, config);
    alert( "성공" );
    this.eniacWordInput.current.value = '';
    this.props.updatePuzzleBoxCount(count);
  }

  async updateEniacWords() {
    if ( ! this.props.puzzleBoxCount ) {
      return alert( 'ERROR : 박스 개수를 먼저 설정해 주세요' );
    }

    const val = this.eniacWordInput.current.value;
    if ( val.length > 0 ) {
      var arr = val.replace(/\s/g, "").split('');

      // 같아서도 안되! 박스가 20개인데, 글자개수가 20개면 안되 !! 마지막 박스는 안그려 지니까 !
      if ( this.props.puzzleBoxCount <= arr.length ) {
        return alert("ERROR : 글자개수가 박스개수보다 적어야 합니다");
      }

      // 마지막 박스는 어차피 글자가 안들어 가니까 원래 박스 개수에서 1개를 빼줘야쥬~
      let zeroArr = new Array((this.props.puzzleBoxCount-1) - arr.length).fill(0);
      let resultArr = [...zeroArr, ...arr];
      utils.shuffle(resultArr);
      let json = JSON.stringify(resultArr);

      const config = {
        method: 'POST',
        url: '/admin/puzzle-settings/eniac-words',
        data: {
          originalEniacWords: val,
          randomEniacWords: json
        }
      };

      let response = await utils.simpleAxios(axios, config);
      this.props.updateEniacWords(val);
      this.props.updateRandomEniacWords(resultArr);
      alert("성공");
      this.eniacWordInput.current.value = '';
    }
  }

  async updateLastBoxGoogleDriveUrl() {
    let url = this.lastBoxGoogleDriveUrlInput.current.value;
    if ( ! utils.isValidURL(url) ) {
      alert( "ERROR : 입력한 구글드라이브 주소를 다시한번 확인해 주세요" );
      return;
    }

    const config = {
      method: 'POST',
      url: '/admin/puzzle-settings/lastbox-google-drive-url',
      data: {
        lastBoxGoogleDriveUrl: encodeURI(url)
      }
    };

    let response = await utils.simpleAxios(axios, config);
    this.props.updateLastBoxGoogleDriveUrl(url);
    alert("성공");
    this.lastBoxGoogleDriveUrlInput.current.value = '';
    
  }

  async updateLastBoxState(e) {
    const val = parseInt(e.currentTarget.value);

    const config = {
      method: 'POST',
      url: '/admin/puzzle-settings/lastbox-state',
      data: {
        lastBoxState: val
      }
    };

    let response = await utils.simpleAxios(axios, config);
    this.props.updateLastBoxState(val);
    alert("성공");
  }

  renderPuzzleBoxCountDropdownMenuItems() {
    let counts = [20, 24, 30, 35, 40, 48];
    var list = [];
    for ( var i = 0; i < counts.length; i++ ) {
      let isActive = (this.props.puzzleBoxCount == counts[i]) ? true : false;
      list.push(
        <DropdownItem active={isActive} key={i} data-count={counts[i]} onClick={this.updatePuzzleBoxCount}>{counts[i]}개</DropdownItem>
      );
    }
    return list;
  }

  render() {
    return (
      <Modal isOpen={ (this.props.activeModalClassName == this.props.className) ? true : false } toggle={this.close} className={this.props.className} size="lg">
        <ModalHeader toggle={this.close}>
          <span>박스 설정</span>
        </ModalHeader>
        <ModalBody>
          <Row>
            <Col xs="12">
              <Label>박스 개수 설정</Label>
            </Col>
            <Col xs="12" className={"d-flex justify-content-between"}>
              <div className="l-left">
                <Dropdown direction="right" isOpen={this.state.btnDropright} toggle={() => { this.setState({ btnDropright: !this.state.btnDropright }); }}>
                  <DropdownToggle color="success" caret>
                    {this.props.puzzleBoxCount}개
                  </DropdownToggle>
                  <DropdownMenu>
                    {this.renderPuzzleBoxCountDropdownMenuItems()}
                  </DropdownMenu>
                </Dropdown>
              </div>
              <div className="l-right d-flex w-75 align-items-center">
                <div className="l-left no-wrap-text mr-2">
                  박스 메세지 :
                </div>
                <InputGroup className="l-right">
                  <input className={"form-control"} placeholder={this.props.eniacWords} ref={this.eniacWordInput}></input>
                  <Button className="ml-2" color="primary" onClick={this.updateEniacWords}>확인</Button>
                </InputGroup>
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
                <FontAwesomeIcon icon={faQuestionCircle} /> 박스 :  
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

export default connect(mapStateToProps, { closeModal, updatePuzzleBoxCount, updateEniacWords, updateRandomEniacWords, updateLastBoxGoogleDriveUrl, updateLastBoxState })(PuzzleSettings);