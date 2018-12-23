import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import socketIOClient from "socket.io-client";
import { teamColors } from '../utils';
import cn from 'classnames';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { updatePuzzleColonInfo } from '../actions';
import Modal from '@material-ui/core/Modal';
import TextField from '@material-ui/core/TextField';

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
    })
    if ( ! this.props.owner ) {
      boxContent = <div className={flipperBoxCN}>
                    <button className="front" data-number={this.props.number} data-hasword={(this.props.word ? true : false)} onClick={this.props.onBoxClick}>
                    </button>
                    <div className="back d-f-center">
                      <span className="team d-f-center"></span>
                      { this.props.word ? <span className="word outline">{this.props.word}</span> : <span className="word placeholder">강</span> }
                    </div>
                  </div>
    } else {
      boxContent = <div className="puzzle-box puzzle-box--normal d-f-center" style={{backgroundColor: this.props.teamColor}}>
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

    this.socket = socketIOClient(this.props.endPoint);
    this.socket.on("puzzle_box_opened", data => {
      console.log( 'data : ', data );
      if ( this.boxes.length == this.props.count ) {
        var node = ReactDOM.findDOMNode(this.boxes[data.boxNumber-1]);
        node.classList.add('flipping', `owner-${data.team}`);
      } else {
        console.error( "박스의 개수가 일치하지 않습니다" );
      }
    });

    this.renderPuzzleBoxes = this.renderPuzzleBoxes.bind(this);
    this.openBox = this.openBox.bind(this);
    this.handleModalOpen = this.handleModalOpen.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleEniacSubmit = this.handleEniacSubmit.bind(this);
    this.handleEniacSentanceInput = this.handleEniacSentanceInput.bind(this);
  }

  renderPuzzleBoxes(teamCount, boxCount, puzzleColonInfo, randomEniacWords) {

    this.boxes = [];

    // 20( 4 x 5 ), 24( 4 x 6 ), 30( 5 x 6 ), 35( 5 x 7 ), 40( 5 x 8 ), 48( 6 x 8 )
    var classWidth = 'w-25';
    if ( boxCount == 30 || boxCount == 35 || boxCount == 40 ) {
      classWidth = 'w-20';
    } 
    else if ( boxCount == 48 ) {
      classWidth = 'w-18';
    }

    // 이거 시간 계산좀 해봐야 겠다,, 루프가 꽤 많이 도네, 많이 돌면 2천번은 돌겠는데 ?
    var boxes = [];
    for ( var i = 0; i < boxCount; i++ ) {
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

      let puzzleBoxClassName = classWidth + ( team ? ` owner-${team}` : '' );

      boxes.push(<PuzzleBox className={puzzleBoxClassName} key={'box-'+boxNumber} number={boxNumber} owner={team} word={word} onBoxClick={this.openBox} ref={(input) => {
        if ( input != null ) {
          this.boxes.push(input);
        }
      }}></PuzzleBox>);
    }

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
      alert( '암호해독을 입력해주세요' );
      return;
    }

    if ( ! this.props.originalEniacWords ) {
      alert( '관리자가 설정값을 지정하지 않았습니다' );
      return window.location.reload(true); // force refresh
    }

    const a = this.state.eniacSentance.replace(/\s/g, "");
    const b = this.props.originalEniacWords.replace(/\s/g, "");
    if ( a === b ) {
      try {
        let response = await axios({
          url: '/user/eniac',
          method: 'POST',
          data: {
            team: this.props.ourTeam,
            point: this.props.mappingPoints.eniac
          }
        });
        if ( response.status == 201 && !response.data.error ) {
          alert("성공 : " + response.data.point + '점을 획득하셨습니다');
          this.setState({ isModalOpen: false });
        } else {
          alert( response.data.error );
        }
      } catch(e) {
        alert('알수없는 에러가 발생했습니다');
        console.error(e);
      } 
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
    let point = this.props.mappingPoints.boxOpenGetEmpty;
    if ( hasWord == 'true' ) {
      point = this.props.mappingPoints.boxOpenGetWord;
    }
    try {
      let response = await axios({
        url: '/user/openBox',
        method: 'POST',
        data: {
          team: this.props.ourTeam,
          boxNumber,
          point,
          boxOpenUse: this.props.mappingPoints.boxOpenUse
        }
      });
      if ( response.status == 201 && !response.data.error ) {
        alert( "성공" );
        this.socket.emit('open_puzzle_box', response.data);
      } 
      else if ( response.data.error ) {
        alert( response.data.error );
      }
    } catch (err) {
      alert("알수없는 에러가 발생하였습니다");
      console.error(err);
    }
  }

  async componentDidMount() {
    try {
      let response = await axios('/user/get-puzzle-colon-info');
      if ( response.status == 201 && !response.data.error ) {
        this.props.updatePuzzleColonInfo(response.data);
      } else {
        console.log( 'error in /user/get-puzzle-colon-info : ', response.data.error );
        alert( response.data.error );
      }
    } catch(e) {
      console.log( 'error : ', e );
    }
  }

  componentWillUnmount() {
    this.socket.disconnect();
  }

  render() {
    let eniacBtnCN = cn({
      'open-eniac-modal-btn': true,
      'd-none': (this.props.originalEniacWords ? false : true)
    });
    let eniacModal = cn({
      'eniac-modal': true,
      'd-none': (this.props.originalEniacWords ? false : true)
    })
    return (
      <div className="puzzle-page full-container">
        <div className="puzzle-container">
          { this.renderPuzzleBoxes(this.props.teamCount, this.props.count, this.props.puzzleColonInfo, this.props.randomEniacWords) }
        </div>
        <Button variant="contained" color="secondary" className={eniacBtnCN} onClick={this.handleModalOpen}>
          암호해독
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
  let puzzleColonInfo = [];
  for ( var i = 0; i < state.teamCount; i++ ) {
    const parsed = JSON.parse(state.puzzleColonInfo[i].numbers);
    puzzleColonInfo.push({
      team: state.puzzleColonInfo[i].team,
      numbers: (parsed ? parsed : [] )
    });
  }

  return {
    teamCount: state.teamCount,
    ourTeam: state.loginData.team,
    count: state.puzzlebox_count,
    puzzleColonInfo,
    mappingPoints: state.mapping_points,
    endPoint: state.rootPath,
    randomEniacWords: state.random_eniac_words,
    originalEniacWords: state.original_eniac_words
  };
}

export default connect(mapStateToProps, { updatePuzzleColonInfo })(Puzzle);