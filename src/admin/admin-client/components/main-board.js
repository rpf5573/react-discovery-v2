import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import cn from 'classnames';
import { shuffle, IMAGE, VIDEO, fileTypeCheck, ERROR } from '../../../utils/client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { Button, Input, Row, Col, InputGroup, Card } from 'reactstrap';

class FileItem extends Component {
  constructor(props) {
    super(props);

    this.input = React.createRef();
    this.onClickBtn = this.onClickBtn.bind(this);
    console.log( 'props : ', props );
  }

  onClickBtn(e) {
    let point = parseInt(this.input.current.value);
    if ( isNaN(point) ) {
      point = 0;
    }
    const team = this.props.team;
    const filename = this.props.filename
    this.props.onRewardPoint(team, point, filename);
  }

  render() {
    return (
      <Card body className="file-item">
        <span className="team">{ this.props.team }</span>
        <div className="l-top">
          { this.props.type == null ? <div className="unsupport-file-type"></div> : '' }
          { this.props.type == IMAGE ? <div className="image-container"> <img src={this.props.src}></img> </div> : '' }
          { this.props.type == VIDEO ? <div className="video-container"> <video width="100%" src={this.props.src} controls> Your browser does not support the video tag. </video> </div> : '' }
        </div>
        <div className="l-bottom">
          <InputGroup>
            <input className="form-control" type="number" min="0" ref={this.input}></input>
            <Button color="primary" onClick={this.onClickBtn}>확인</Button>
          </InputGroup>
        </div>
      </Card>
    );
  }
}

class MainBoard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      uploadInfos: []
    };

    this.loadUploadInfos = this.loadUploadInfos.bind(this);
    this.rewardPoint = this.rewardPoint.bind(this);
  }

  async rewardPoint(team, point, filename) {
    try {
      let response = await axios({
        method: 'POST',
        url: '/admin/point-reward/upload',
        data: {
          team,
          point,
          filename
        }
      });
      if ( response.status == 201 ) {
        if ( response.data.error ) {
          alert( response.data.error );
        } else {
          let newUploadInfos = [...this.state.uploadInfos];
          for ( var i = 0; i < newUploadInfos.length; i++ ) {
            if ( newUploadInfos[i].team == team && Array.isArray(newUploadInfos[i].files) ) {
              newUploadInfos[i].files = newUploadInfos[i].files.filter( val => val !== filename );
              break;
            }
          }
          alert( `성공 : ${team}팀에게 ${point}점을 지급하였습니다` );
          this.setState({
            uploadInfos: newUploadInfos
          });
        }
      }
    } catch(e) {
      console.error(e);
      alert( ERROR.unknown );
    }
  }

  async loadUploadInfos(e) {
    if ( ! this.props.teamCount ) {
      return alert("아직 파일을 불러올 수 없습니다.먼저 팀설정을 해주시기 바랍니다");
    }
    try {
      let response = await axios({
        method: 'POST',
        url: '/admin/load-upload-infos',
        data: {
          teamCount: this.props.teamCount
        }
      });
      if ( response.status == 201 ) {
        if ( response.data.error ) {
          return alert( response.data.error );
        } else {
          shuffle(response.data.uploadInfos); // 한번 섞어줘야 공평하게 위에서 부터 뜨지 !
          for ( var i = 0; i < response.data.uploadInfos.length; i++ ) {
            let parsed = JSON.parse(response.data.uploadInfos[i].files);
            response.data.uploadInfos[i].files = parsed;
          }
          this.setState({
            uploadInfos: response.data.uploadInfos
          });
        }
      } else {
        alert( ERROR.unknown );
      }
    } catch(e) {
      console.error(e);
    }
  }

  renderUploadInfos(data) {
    var list = [];
    for ( var i = 0; i < data.length; i++ ) {
      const team = data[i].team;
      let files = data[i].files;
      if ( files ) {
        for ( var z = 0; z < files.length; z++ ) {
          var type = fileTypeCheck(files[z]); // null도 일단 받자.
          const filename = files[z];
          list.push(
            <Col xs="4" key={`${team}-${i}-${z}-${filename}`}>
              <FileItem team={team} src={`/user/uploads/${team}/${filename}`} filename={filename} type={type} onRewardPoint={this.rewardPoint} ></FileItem>
            </Col>
          );
        }
      }
    }

    return list;
  }

  render() {
    console.log( 'render', ' is called' );
    return (
      <Row>
        { (this.props.teamCount && Array.isArray(this.state.uploadInfos)) ? this.renderUploadInfos(this.state.uploadInfos) : '' }
        <button className="load-files-btn" onClick={this.loadUploadInfos}>
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </Row>
    );
  }

}

function mapStateToProps(state, ownProps) {
  return {
    teamCount: state.teamSettings.teamCount,
  };
}

export default connect(mapStateToProps, null)(MainBoard);