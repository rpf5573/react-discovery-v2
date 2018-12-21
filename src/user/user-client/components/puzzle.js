import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import socketIOClient from "socket.io-client";
import cn from 'classnames';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { updatePuzzleColonInfo } from '../actions';

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
      'flipping': this.props.isFlipped
    })
    if ( ! this.props.owner ) {
      boxContent = <div className={flipperBoxCN}>
                    <button className="front" data-number={this.props.number} data-hasword={(this.props.word ? true : false)} onClick={this.props.onBoxClick}>
                    </button>
                    <div className="back">
                      { this.props.owner ? <span className="team">{this.props.owner}</span> : '' }
                      { this.props.word ? <span className="word">{this.props.word}</span> : '' }
                    </div>
                  </div>
    } else {
      boxContent = <div className="puzzle-box puzzle-box--normal" style={{backgroundColor: this.props.teamColor}}>
                    { this.props.owner ? <span className="team">{this.props.owner}</span> : '' }
                    { this.props.word ? <span className="word">{this.props.word}</span> : '' }
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

    const socket = socketIOClient(this.props.endPoint);
    socket.on("puzzle_box_opened", data => { console.log( 'data : ', data ); });

    this.renderPuzzleBoxes = this.renderPuzzleBoxes.bind(this);
    this.openBox = this.openBox.bind(this);
  }

  renderPuzzleBoxes(teamCount, boxCount, puzzleColonInfo) {
    // 20( 4 x 5 ), 24( 4 x 6 ), 30( 5 x 6 ), 35( 5 x 7 ), 40( 5 x 8 ), 48( 6 x 8 )
    var classWidth = 'w-25';
    if ( boxCount == 30 || boxCount == 35 || boxCount == 40 ) {
      classWidth = 'w-20';
    } 
    else if ( boxCount == 48 ) {
      classWidth = 'w-18';
    }

    let flippedBoxNumber = 5;

    // 이거 시간 계산좀 해봐야 겠다,, 루프가 꽤 많이 도네, 많이 돌면 2천번은 돌겠는데 ?
    var boxes = [];
    for ( var i = 0; i < boxCount; i++ ) {
      var boxNumber = i+1;
      var isFlipped = ( flippedBoxNumber == boxNumber ? true : false );
      var team = false;
      for ( var z = 0; z < teamCount; z++ ) {
        for ( var m = 0; m < puzzleColonInfo[z].numbers.length; i++ ) {
          if ( boxNumber == puzzleColonInfo[z].numbers[m] ) {
            team = puzzleColonInfo[z].team;
          }
        }
        // team을 찾았으면 루프 그만 돌아도 될듯 !
        if ( team ) {
          break;
        }
      }
      boxes.push(<PuzzleBox className={classWidth} key={'box-'+boxNumber} number={boxNumber} owner={team} isFlipped={isFlipped} word="A" onBoxClick={this.openBox}></PuzzleBox>);
    }

    return boxes;
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
          point
        }
      });
      if ( response.status == 201 && !response.data.error ) {
        alert( "성공" );
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

  render() {
    return (
      <div className="puzzle-page full-container">
        <div className="puzzle-container">
          { this.renderPuzzleBoxes(this.props.teamCount, this.props.count, this.props.puzzleColonInfo) }
        </div>
        <Button variant="contained" color="secondary" className="open-eniac-modal-btn">
          암호해독
        </Button>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    ourTeam: state.loginData.team,
    count: state.puzzlebox_count,
    puzzleColonInfo: state.puzzleColonInfo,
    mappingPoints: state.mapping_points,
    endPoint: state.rootPath
  };
}

export default connect(mapStateToProps, { updatePuzzleColonInfo })(Puzzle);