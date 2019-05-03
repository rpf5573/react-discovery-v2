import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import socketIOClient from "socket.io-client";
import * as utils from '../../../utils/client';
import * as constants from '../../../utils/constants';
import cn from 'classnames';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { updatePuzzleColonInfos } from '../actions';
import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';
import HelpOutline from '@material-ui/icons/HelpOutline';
import NotReady from './not-ready';

class PuzzleBox extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let wrapperClassName = cn(['puzzle-box-wrapper', this.props.className]);
    var boxContent = false;
    let flipperBoxCN = cn({
      'puzzle-box': true,
      'puzzle-box--flipper': true,
    });

    // last인지가 나는 중요해 !
    if ( this.props.isLast ) {
      boxContent = (<button className="puzzle-box puzzle-box--normal d-f-center puzzle-box--last" onClick={this.props.onBoxClick}>
        <HelpOutline></HelpOutline>
      </button>)
    }
    else if ( ! this.props.owner ) {
      boxContent = <div className={flipperBoxCN}>
                    <div className="front">
                      <button className="front-inner-btn" data-number={this.props.number} data-hasword={(this.props.word ? true : false)} onClick={this.props.onBoxClick}></button>
                    </div>
                    <div className="back d-f-center">
                      <span className="team d-f-center"></span>
                      { this.props.word ? <span className="word outline">{this.props.word}</span> : <span className="word placeholder">강</span> }
                    </div>
                  </div>
    } 
    else if ( this.props.owner ) {
      boxContent = <div className="puzzle-box puzzle-box--normal d-f-center">
                    { this.props.owner ? <span className="team"></span> : '' }
                    { this.props.word ? <span className="word outline">{this.props.word}</span> : <span className="word placeholder">강</span> }
                  </div>
    } 

    return (
      <div className={wrapperClassName}>
        { boxContent }        
      </div>
    )
  }
}

class Puzzle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false,
      eniacSentance: false,
    };

    // 이걸 굳이 state에 넣을 필요는 없지 ! View에 반영되는건 아니니께~
    this.socket = socketIOClient(this.props.endPoint);
    this.socket.on("puzzle_box_opened", data => {
      // 여기서 말하는 boxes는 lastBox를 제외한거야
      if ( this.boxes.length == this.props.count - 1 ) {
        var node = ReactDOM.findDOMNode(this.boxes[data.boxNumber-1]);
        node.classList.add('flipping', `owner-${data.team}`);
      } else {
        console.error( "구역의 개수가 일치하지 않습니다" );
      }
    });

    this.freeze = false;

    this.renderPuzzleBoxes = this.renderPuzzleBoxes.bind(this);
    this.openBox = this.openBox.bind(this);
    this.openLastBox = this.openLastBox.bind(this);
    this.handleModalOpen = this.handleModalOpen.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleEniacSubmit = this.handleEniacSubmit.bind(this);
    this.handleEniacSentanceInput = this.handleEniacSentanceInput.bind(this);

    this.hiddenAnchorForNewTab = React.createRef();
  }

  renderPuzzleBoxes(teamCount, boxCount, puzzleColonInfos, randomEniacWords) {
    this.boxes = [];

    // 20( 4 x 5 ), 24( 4 x 6 ), 30( 5 x 6 ), 35( 5 x 7 ), 40( 5 x 8 ), 48( 6 x 8 ), 54( 6 x 9 ), 60( 6 x 10 )
    var classWidth = 'w-25';
    switch( boxCount ) {
      case 30:
      case 35:
      case 40:
        classWidth = 'w-20';
        break;
      case 48:
      case 54:
      case 60:
      case 66:
        classWidth = 'w-18';
        break;
    }

    // 이거 시간 계산좀 해봐야 겠다,, 루프가 꽤 많이 도네, 많이 돌면 2천번은 돌겠는데 ?
    var boxes = []; // this.boxes랑 햇갈리지 마랑!
    for ( var i = 0; i < boxCount - 1; i++ ) { // 마지막에 하나 빼먹어야지 !
      var boxNumber = i+1;
      const word = ( randomEniacWords ? (randomEniacWords[i] ? randomEniacWords[i] : false) : false );
      var team = false;
      for ( var z = 0; z < teamCount; z++ ) {
        for ( var m = 0; m < puzzleColonInfos[z].boxNumbers.length; m++ ) {
          if ( boxNumber == puzzleColonInfos[z].boxNumbers[m] ) {
            team = puzzleColonInfos[z].team;
          }
        }
        // team을 찾았으면 루프 그만 돌아도 될듯 !
        if ( team ) {
          break;
        }
      }

      const puzzleBoxClassName = classWidth + ( team ? ` owner-${team}` : '' );

      boxes.push(<PuzzleBox className={puzzleBoxClassName} key={'box-'+boxNumber} number={boxNumber} owner={team} word={word} onBoxClick={this.openBox} ref={(input) => {
        if ( input != null ) {
          this.boxes.push(input);
        }
      }}></PuzzleBox>);
    }

    const puzzleBoxClassName = classWidth + ' last-box';
    // 마지막엔 이벤트 박스 넣어줘야징 !
    boxes.push(<PuzzleBox className={puzzleBoxClassName} key='last-box' isLast number={boxNumber} onBoxClick={this.openLastBox} href={this.props.lastBoxUrl} ></PuzzleBox>);

    return boxes;
  }

  handleModalOpen = () => {
    this.setState({ isModalOpen: true });
  };

  handleModalClose = () => {
    this.setState({ isModalOpen: false });
  };

  async handleEniacSubmit(e) {
    e.preventDefault();
    if ( ! this.state.eniacSentance ) {
      alert( '문장해독을 입력해주세요' );
      return;
    }

    if ( ! this.props.originalEniacWords ) {
      alert( '관리자가 설정값을 지정하지 않았습니다' );
      return window.location.reload(true); // force refresh
    }

    const a = this.state.eniacSentance.replace(/\s/g, "");
    const b = this.props.originalEniacWords.replace(/\s/g, "");
    if ( a === b ) {
      const config = {
        url: '/user/eniac',
        method: 'POST',
        data: {
          team: this.props.ourTeam,
          point: this.props.mappingPoints.eniac
        }
      };
      axios(config).then(response => {
        if ( response.data.error ) {
          this.props.openAlertModal(true, 'error', response.data.error, false, this.props.closeAlertModal);
          return;
        }
        const message = `성공 : ${response.data.rank}등으로 맞춰, ${response.data.point} 점을 획득하셨습니다 !`;
        this.props.openAlertModal(false, false, message, ()=>{
          this.props.closeAlertModal();
          this.setState({ isModalOpen: false });
        }, false);
      }).catch(e => {
        this.props.openAlertModal(true, 'error', e, false, this.props.closeAlertModal);
      });
    } else {
      this.props.openAlertModal(true, 'error', '다시 확인해 주시기 바랍니다', false, this.props.closeAlertModal);
    }
  }

  handleEniacSentanceInput(e) {
    this.setState({ eniacSentance: event.target.value });
  }

  async openBox(e) {
    if ( this.freeze ) {
      return;
    }
    this.freeze = true;
    let that = this;
    setTimeout(function(){
      that.freeze = false;
    }, 2000);

    let boxNumber = parseInt(e.currentTarget.getAttribute('data-number'));
    let hasWord = e.currentTarget.getAttribute('data-hasword');
    let puzzlePoint = this.props.mappingPoints.boxOpenGetEmpty;
    let pointMessage = `글자없는구역 : ${puzzlePoint}점 획득`;

    // point check
    let config = {
      url: '/user/point-check',
      method: 'POST',
      data: {
        team: this.props.ourTeam,
        boxOpenUse: this.props.mappingPoints.boxOpenUse,
      }
    };
    axios(config).then(response => {
      if ( response.data.error ) {
        this.props.openAlertModal(true, 'error', response.data.error, false, this.props.closeAlertModal);
        return;
      }

      if ( hasWord == 'true' ) {
        puzzlePoint = this.props.mappingPoints.boxOpenGetWord;
        pointMessage = `글자있는구역 : ${puzzlePoint}점 획득`;
      }

      config = {
        url: '/user/openBox',
        method: 'POST',
        data: {
          team: this.props.ourTeam,
          boxNumber,
          type: (hasWord == 'true' ? constants.WORD : constants.EMPTY),
          puzzlePoint,
          boxOpenUse: this.props.mappingPoints.boxOpenUse,
          teamCount: this.props.teamCount,
          maxLocation: this.props.maxLocation,
          bingoPointPerLine: this.props.mappingPoints.bingo
        }
      };
      axios(config).then(response => {
        if ( response.data.error ) {
          this.props.openAlertModal(true, 'error', response.data.error, false, this.props.closeAlertModal);
          return;
        }

        // grid update하구요
        this.socket.emit('open_puzzle_box', response.data);
        const { bingoPoint, bingoCount } = response.data;
        if ( bingoPoint > 0 ) {
          pointMessage = `${pointMessage} + ${parseInt(bingoCount)*3}개의 구역연결로 ${bingoPoint}점 획득`;
        }
        this.props.openAlertModal(false, false, pointMessage, this.props.closeAlertModal, false);
      }).catch(e => {
        this.props.openAlertModal(true, 'error', e, false, this.props.closeAlertModal);
      });
    }).catch(e => {
      this.props.openAlertModal(true, 'error', e, false, this.props.closeAlertModal);
    });
  }

  async openLastBox(e) {
    axios('/user/open-lastbox').then(() => {
      if ( ! this.props.lastBoxUrl ) {
        const message = "현재 영상이 설정되어있지 않습니다. 새로고침 하거나, 관리자에게 문의 해주시기 바랍니다";
        this.props.openAlertModal(true, 'error', message, false, this.props.closeAlertModal);
      } else {
        this.hiddenAnchorForNewTab.current.click();
      }
    }).catch(e => {
      this.props.openAlertModal(true, 'error', e, false, this.props.closeAlertModal);
    });
  }

  async componentDidMount() {
    const config = {
      method: 'POST',
      url: '/user/get-puzzle-colon-infos',
      data: {
        teamCount: this.props.teamCount
      }
    }
    axios(config).then(response => {
      this.props.updatePuzzleColonInfos(response.data);
    }).catch(e => {
      this.props.openAlertModal(true, 'error', e, false, this.props.closeAlertModal);
    });
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  render() {
    if ( !this.props.count) {
      return ( <NotReady></NotReady> );
    }

    let eniacBtnCN = cn({
      'open-eniac-modal-btn': true,
      'd-none': (this.props.originalEniacWords ? false : true)
    });
    let eniacModal = cn({
      'eniac-modal': true,
      'd-none': (this.props.originalEniacWords ? false : true)
    });

    return (
      <div className="puzzle-page full-container">
        <a className="d-none" href={this.props.lastBoxUrl} target="_blank" rel="noopener noreferrer" ref={this.hiddenAnchorForNewTab}></a>
        <div className="puzzle-container">
          { this.renderPuzzleBoxes(this.props.teamCount, this.props.count, this.props.puzzleColonInfos, this.props.randomEniacWords) }
        </div>
        <Button variant="contained" color="secondary" className={eniacBtnCN} onClick={this.handleModalOpen}>
          문장해독
        </Button>
        <Modal
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          open={this.state.isModalOpen}
          onClose={this.handleModalClose}
          className={eniacModal}>
            <div className="modal-content">
              <form className="eniac-form" noValidate autoComplete="off" onSubmit={this.handleEniacSubmit}>
                <div className="l-top">
                  <TextField
                    className="eniac-input"
                    label="문장입력"
                    variant="outlined"
                    onChange={this.handleEniacSentanceInput}
                  />
                </div>
                <div className="l-bottom">
                  <Button className="eniac-btn" variant="contained" color="primary" type="submit">
                    확인
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
      </div>
    );
  }
  
}

function mapStateToProps(state, ownProps) {
  const boxCount = parseInt(state.puzzleBoxCount);

  let puzzleColonInfos = [];
  // puzzleColonInfos는 없을 수가 없다
  for ( var i = 0; i < state.puzzleColonInfos.length; i++ ) {
    const parsed = JSON.parse(state.puzzleColonInfos[i].boxNumbers);
    puzzleColonInfos.push({
      team: state.puzzleColonInfos[i].team,
      boxNumbers: (parsed ? parsed : [] )
    });
  }

  var maxLocation = [4,5];
  switch(boxCount) {
    case 24:
      maxLocation = [4,6];
      break;
    case 30:
      maxLocation = [5,6];
      break;
    case 35:
      maxLocation = [5,7];
      break;
    case 40:
      maxLocation = [5,8];
      break;
    case 48:
      maxLocation = [6,8];
      break;
    case 54:
      maxLocation = [6,9];
      break;
    case 60:
      maxLocation = [6,10];
      break;
    case 66:
      maxLocation = [6,11];
      break;
  }

  return {
    teamCount: parseInt(state.teamCount), // 이게 없을때는 DB에서 string 0를 가져온다
    ourTeam: state.loginData.team,
    count: boxCount, // 이게 없을때는 DB에서 string 0를 가져온다
    puzzleColonInfos,
    mappingPoints: state.mappingPoints,
    endPoint: state.rootPath,
    randomEniacWords: state.randomEniacWords,
    originalEniacWords: state.originalEniacWords,
    lastBoxUrl: state.lastBoxUrl,
    maxLocation
  };
}

export default connect(mapStateToProps, { updatePuzzleColonInfos })(Puzzle);