import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import * as utils from '../../../utils/client';
import cn from 'classnames';
import axios from 'axios';
import { updatePuzzleColonInfos } from '../actions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
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
        <FontAwesomeIcon icon={faQuestionCircle}></FontAwesomeIcon>
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
    };

    this.renderPuzzleBoxes = this.renderPuzzleBoxes.bind(this);
    
    this.openLastBox = this.openLastBox.bind(this);
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
    var boxes = [];
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

  async openLastBox(e) {
    utils.simpleAxios(axios, '/user/open-lastbox').then(() => {    
      if ( ! this.props.lastBoxUrl ) {
        alert( "현재 영상이 설정되어있지 않습니다. 새로고침 하거나, 관리자에게 문의 해주시기 바랍니다" );
      } else {
        this.hiddenAnchorForNewTab.current.click();
      }
    });
  }

  async componentDidMount() {
    if ( ! this.props.teamCount ) {
      return;
    }
    const config = {
      method: 'POST',
      url: '/user/get-puzzle-colon-infos',
      data: {
        teamCount: this.props.teamCount
      }
    }
    utils.simpleAxios(axios, config).then(response => {
      this.props.updatePuzzleColonInfos(response.data);
    });
  }

  render() {
    if ( !this.props.count) {
      return ( <NotReady></NotReady> );
    }

    return (
      <div className="puzzle-page full-container">
        <a className="d-none" href={this.props.lastBoxUrl} target="_blank" rel="noopener noreferrer" ref={this.hiddenAnchorForNewTab}></a>
        <div className="puzzle-container">
          { this.renderPuzzleBoxes(this.props.teamCount, this.props.count, this.props.puzzleColonInfos, this.props.randomEniacWords) }
        </div>
        </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  let puzzleColonInfos = [];
  // 여기도 없을 수가 없어, 그 이유는 (1)initialState에서 getAll()했기 때문에 15개의 원소가 담겨있는 배열이 올것이고,
  // (2)위에서 axios로 가져올때, teamCount가 없으면 아예 가져오는거 자체를 안하기 때문이지 !
  // 햇갈리면 안되는게 puzzleColonInfos가 있어야 박스를 그리는건 아니야 !! 둘은 별개야 별개 !
  for ( var i = 0; i < state.puzzleColonInfos.length; i++ ) {
    const parsed = JSON.parse(state.puzzleColonInfos[i].boxNumbers);
    puzzleColonInfos.push({
      team: state.puzzleColonInfos[i].team,
      boxNumbers: (parsed ? parsed : [] )
    });
  }

  return {
    teamCount: parseInt(state.teamCount), // [string 0]일 수도 있으니까 parseInt
    count: parseInt(state.puzzleBoxCount), // [string 0]일 수도 있으니까 parseInt
    puzzleColonInfos,
    randomEniacWords: state.randomEniacWords,
    lastBoxUrl: state.lastBoxUrl
  };
}

export default connect(mapStateToProps, { updatePuzzleColonInfos })(Puzzle);