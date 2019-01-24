import React, { Component } from 'react';
import { connect } from 'react-redux';
import cn from 'classnames';
import * as utils from '../../../../utils/client';
import { Modal, ModalHeader, ModalBody, Alert } from 'reactstrap';
import { closeModal } from '../../actions';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

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

class PuzzlePage extends Component {
  constructor(props) {
    super(props);

    this.renderPuzzleBoxes = this.renderPuzzleBoxes.bind(this);
    this.openLastBox = this.openLastBox.bind(this);
    this.hiddenAnchorForNewTab = React.createRef();
  }

  renderPuzzleBoxes(teamCount = 0, boxCount, puzzleColonInfos, randomEniacWords) {

    // 박스가 있어야 그리던가 말던가 하지 !
    if ( ! boxCount ) {
      return (<div>구역 설정을 먼저 해주세요</div>);
    }

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

      // 아래의 componeneDidMout에서 teamCount가 없는 경우에는 안가져 왔는데,
      // 여기서도 puzzleColonInfos가 어차피 teamCount안에서 루프를 도는거니까, 안전함
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

  render() {
    return (
      <div className="puzzle-page">
        <a className="d-none" href={this.props.lastBoxUrl} target="_blank" rel="noopener noreferrer" ref={this.hiddenAnchorForNewTab}></a>
        <div className="puzzle-container">
          { this.renderPuzzleBoxes(this.props.teamCount, this.props.count, this.props.puzzleColonInfos, this.props.randomEniacWords) }
        </div>
      </div>
    );
  }
}

class PuzzleStatusModal extends React.Component {
  constructor(props) {
    super(props);
    this.pointInputFields = [];
    this.state = {
      backdrop: true,
      puzzleColonInfos: []
    };

    this.close = this.close.bind(this);
    this.onOpened = this.onOpened.bind(this);
    this.getPuzzleColonInfos = this.getPuzzleColonInfos.bind(this);
  }

  close() {
    this.props.closeModal();
  }

  render() {

    return (
      <Modal isOpen={ (this.props.activeModalClassName == this.props.className) ? true : false } toggle={this.close} className={this.props.className} onOpened={this.onOpened} size="md">
        <ModalHeader toggle={this.close}>
          유저의 구역 점유 현황
        </ModalHeader>
        <ModalBody>
          { (this.props.puzzleBoxCount > 0 && this.state.puzzleColonInfos.length > 0) ? <PuzzlePage lastBoxUrl={this.props.lastBoxUrl} teamCount={this.props.teamCount} count={this.props.puzzleBoxCount} puzzleColonInfos={this.state.puzzleColonInfos} randomEniacWords={this.props.randomEniacWords} ></PuzzlePage> : '' }
          { !this.props.puzzleBoxCount ? <Alert color="warning"> 구역 설정을 해주세요 </Alert> : '' }
        </ModalBody>
      </Modal>
    );
  }

  async onOpened() {
    await this.getPuzzleColonInfos();
  }

  async getPuzzleColonInfos() {
    // 팀수가 있어야 뭘 가져오던가 하지
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

    utils.simpleAxios(axios, config).then((response) => {
      let puzzleColonInfos = [];
      for ( var i = 0; i < response.data.length; i++ ) {
        const parsed = JSON.parse(response.data[i].boxNumbers);
        puzzleColonInfos.push({
          team: response.data[i].team,
          boxNumbers: (parsed ? parsed : [] )
        });
      }
      
      this.setState({
        puzzleColonInfos
      });
    });
  }
}

function mapStateToProps(state, ownProps) {
  return {
    activeModalClassName : state.modalControl.activeModalClassName,
    teamCount: state.teamSettings.teamCount,
    lastBoxUrl: state.puzzleSettings.lastBoxUrl,
    randomEniacWords: state.puzzleSettings.randomEniacWords,
    puzzleBoxCount: state.puzzleSettings.puzzleBoxCount,
  };
}

export default connect(mapStateToProps, { closeModal })(PuzzleStatusModal);