import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import socketIOClient from "socket.io-client";
import * as utils from '../../../utils/client';
import * as constants from '../../../utils/constants';
import cn from 'classnames';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { updatePuzzleColonInfo } from '../actions';
import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';
import HelpOutline from '@material-ui/icons/HelpOutline';
import NotReady from './not-ready';
import { withMobileDialog } from '@material-ui/core';

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
                    <button className="front" data-number={this.props.number} data-hasword={(this.props.word ? true : false)} onClick={this.props.onBoxClick}>
                    </button>
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
      eniacSentance: false
    };

    console.log( 'puzzle component constructor : ' );

    // 이걸 굳이 state에 넣을 필요는 없지 ! View에 반영되는건 아니니께~
    this.grid = (this.props.count > 0 ? utils.makeGrid(this.props.maxLocation, this.props.puzzleColonInfo) : false);

    this.socket = socketIOClient(this.props.endPoint);
    this.socket.on("puzzle_box_opened", data => {
      // 여기서 말하는 boxes는 lastBox를 제외한거야
      if ( this.boxes.length == this.props.count - 1 ) {
        var node = ReactDOM.findDOMNode(this.boxes[data.boxNumber-1]);
        node.classList.add('flipping', `owner-${data.team}`);
      } else {
        console.error( "박스의 개수가 일치하지 않습니다" );
      }
    });

    this.renderPuzzleBoxes = this.renderPuzzleBoxes.bind(this);
    this.openBox = this.openBox.bind(this);
    this.openLastBox = this.openLastBox.bind(this);
    this.handleModalOpen = this.handleModalOpen.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleEniacSubmit = this.handleEniacSubmit.bind(this);
    this.handleEniacSentanceInput = this.handleEniacSentanceInput.bind(this);
    this.checkBingo = this.checkBingo.bind(this);
    this.updateGrid = this.updateGrid.bind(this);

    this.hiddenAnchorForNewTab = React.createRef();
  }

  renderPuzzleBoxes(teamCount, boxCount, puzzleColonInfo, randomEniacWords) {
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
        for ( var m = 0; m < puzzleColonInfo[z].numbers.length; m++ ) {
          if ( boxNumber == puzzleColonInfo[z].numbers[m] ) {
            team = puzzleColonInfo[z].team;
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
    boxes.push(<PuzzleBox className={puzzleBoxClassName} key='last-box' isLast number={boxNumber} onBoxClick={this.openLastBox} href={this.props.lastBoxGoogleDriveUrl} ></PuzzleBox>);

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
      let response = await utils.simpleAxios(axios, config);
      alert(`성공 : ${response.data.rank}등으로 맞춰, ${response.data.point} 점을 획득하셨습니다 !`);
      this.setState({ isModalOpen: false });
    } else {
      alert("다시 확인해 주시기 바랍니다");
    }
    
  }

  handleEniacSentanceInput(e) {
    this.setState({ eniacSentance: event.target.value });
  }

  async openBox(e) {
    let boxNumber = parseInt(e.currentTarget.getAttribute('data-number'));
    let hasWord = e.currentTarget.getAttribute('data-hasword');
    let puzzlePoint = this.props.mappingPoints.boxOpenGetEmpty;

    this.updateGrid(boxNumber, this.props.ourTeam);
    console.log( 'updated grid : ', this.grid );

    let totalCount = this.checkBingo( boxNumber, this.props.ourTeam );
    console.log( 'totalCount : ', totalCount );
    let bingoPoint = totalCount * this.props.mappingPoints.bingo;

    if ( hasWord == 'true' ) {
      puzzlePoint = this.props.mappingPoints.boxOpenGetWord;
    }
    const config = {
      url: '/user/openBox',
      method: 'POST',
      data: {
        team: this.props.ourTeam,
        boxNumber,
        type: (hasWord == 'true' ? constants.WORD : constants.EMPTY),
        puzzlePoint,
        bingoPoint,
        boxOpenUse: this.props.mappingPoints.boxOpenUse,
        teamCount: this.props.teamCount
      }
    };
    let response = await utils.simpleAxios(axios, config);
    // grid update하구요
    this.socket.emit('open_puzzle_box', response.data);
    if ( bingoPoint > 0 ) {
      alert( `성공 - ${totalCount}개의 빙고를 맞추셔서 ${bingoPoint}를 추가로 획득하셨습니다` );
    } else {
      alert( "성공" );
    }
    
  }

  async openLastBox(e) {
    let response = await utils.simpleAxios(axios, '/user/open-lastbox');
    if ( ! this.props.lastBoxGoogleDriveUrl ) {
      return alert( "현재 영상이 설정되어있지 않습니다. 새로고침 하거나, 관리자에게 문의 해주시기 바랍니다" );
    } else {
      this.hiddenAnchorForNewTab.current.click();
    }
  }

  async componentDidMount() {
    const config = {
      method: 'POST',
      url: '/user/get-puzzle-colon-info',
      data: {
        teamCount: this.props.teamCount
      }
    }
    let response = await utils.simpleAxios(axios, config);
    this.props.updatePuzzleColonInfo(response.data);
  }

  checkBingo(boxNumber, team) {
    const xMax = this.grid.length - 1;
    const yMax = this.grid[0].length - 1;
    var totalCount = 0;
    let location = utils.boxNumberToLocation(boxNumber, this.props.maxLocation);

    /*  가로
    /* --------------------------------------------------- */
    var x = location[0];
    var y = location[1];
    var count = 0;

    /* ------ 맨 왼쪽으로 이동 ------ */
    while(x > 0 && this.grid[x-1][y] == team) {
      x--;
    }

    /* ------ 오른쪽으로 2개 발견할때까지 이동 왜냐면 내가 방금 누른곳이 거기니까 ------ */
    while(x <= xMax && this.grid[x][y] == team) {
      x += 1;
      count++;

      // 딱 3개만 발견해야 하는거니까, 3개째는 추가하고 4개째는 멈춰! 4개째 멈췄으니까 5개째는 당연히 없겠지 !
      // 왜 이렇게 하냐고? 다 세고 3개 이상인지 체크하는건 비효율 적이기 때문이지
      if ( count == 3) {
        totalCount += 1;
      }
      if ( count == 4 ) {
        // 야 취소취소, 하나 추가한거 취소 퇘퇘퇘 !
        totalCount -= 1;
        break;
      }
    }



    /*  세로
    /* --------------------------------------------------- */
    x = location[0];
    y = location[1];
    count = 0;

    /* ------ 위쪽으로 이동 ------ */
    while(y > 0 && this.grid[x][y-1] == team) {
      y--;
    }

    /* ------ 아래쪽으로 3개 발견할때까지 이동 ------ */
    while(y <= yMax && this.grid[x][y] == team) {
      y += 1;
      count++;

      if ( count == 3) {
        totalCount += 1;
      }
      if ( count == 4 ) {
        // 야 취소취소, 하나 추가한거 취소 퇘퇘퇘 !
        totalCount -= 1;
        break;
      }
    }



    /*  오른쪽 위 대각
    /* --------------------------------------------------- */
    x = location[0];
    y = location[1];
    count = 0;

    /* ------ 오른쪽위으로 이동 ------ */
    while((y > 0 && x < xMax) && this.grid[x+1][y-1] == team) {
      x++;
      y--;
    }

    /* ------ 아래왼쪽으로 3개 발견할때까지 이동 ------ */
    while((y <= yMax && x >= 0) && this.grid[x][y] == team) {
      x--;
      y++;
      count++;

      if ( count == 3) {
        totalCount += 1;
      }
      if ( count == 4 ) {
        // 야 취소취소, 하나 추가한거 취소 퇘퇘퇘 !
        totalCount -= 1;
        break;
      }
    }



    /*  왼쪽 위 대각
    /* --------------------------------------------------- */
    x = location[0];
    y = location[1];
    count = 0;

    /* ------ 왼쪽위으로 이동 ------ */
    while((x > 0 && y > 0) && this.grid[x-1][y-1] == team) {
      x--;
      y--;
    }

    /* ------ 아래오른쪽으로 2개 발견할때까지 이동 ------ */
    while((y <= yMax && x <= xMax) && this.grid[x][y] == team) {
      x++;
      y++;
      count++;

      if ( count == 3) {
        totalCount += 1;
      }
      if ( count == 4 ) {
        // 야 취소취소, 하나 추가한거 취소 퇘퇘퇘 !
        totalCount -= 1;
        break;
      }
    }

    return totalCount;
  }

  updateGrid(boxNumber, team) {
    let location = utils.boxNumberToLocation(boxNumber, this.props.maxLocation);
    console.log( 'location : ', location );
    this.grid[location[0]][location[1]] = team;
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
        <a className="d-none" href={this.props.lastBoxGoogleDriveUrl} target="_blank" rel="noopener noreferrer" ref={this.hiddenAnchorForNewTab}></a>
        <div className="puzzle-container">
          { this.renderPuzzleBoxes(this.props.teamCount, this.props.count, this.props.puzzleColonInfo, this.props.randomEniacWords) }
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
  const boxCount = parseInt(state.puzzlebox_count);

  let puzzleColonInfo = [];
  // puzzleColonInfo는 없을 수가 없다
  for ( var i = 0; i < state.puzzleColonInfo.length; i++ ) {
    const parsed = JSON.parse(state.puzzleColonInfo[i].numbers);
    puzzleColonInfo.push({
      team: state.puzzleColonInfo[i].team,
      numbers: (parsed ? parsed : [] )
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
  }

  return {
    teamCount: parseInt(state.teamCount), // 이게 없을때는 DB에서 string 0를 가져온다
    ourTeam: state.loginData.team,
    count: boxCount, // 이게 없을때는 DB에서 string 0를 가져온다
    puzzleColonInfo,
    mappingPoints: state.mapping_points,
    endPoint: state.rootPath,
    randomEniacWords: state.random_eniac_words,
    originalEniacWords: state.original_eniac_words,
    lastBoxGoogleDriveUrl: state.lastbox_google_drive_url,
    maxLocation
  };
}

export default connect(mapStateToProps, { updatePuzzleColonInfo })(Puzzle);