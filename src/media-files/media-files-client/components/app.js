import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import cn from 'classname';
import * as utils from '../../../utils/client';
import * as constants from '../../../utils/constants';
import { Button, Row, Col, InputGroup, Card, } from 'reactstrap';
import { makeStackFileDownloaded } from '../actions/index';

// css
import 'bootstrap/dist/css/bootstrap.css';
import '../scss/style.scss';

class FileItem extends Component {
  constructor(props) {
    super(props);
    this.onClickCurtain = this.onClickCurtain.bind(this);
  }

  onClickCurtain() {
    this.props.onClickCurtain(this.props.team, this.props.filename);
  }

  render() {
    const curtainCN = cn({
      curtain: true,
      'd-none': this.props.downloaded
    })
    return (
      <Card body className="file-item">
        <div className={curtainCN} onClick={this.onClickCurtain}></div>
        { this.props.type == null ? <div className="unsupport-file-type"></div> : '' }
        { this.props.type == constants.IMAGE ? <div className="image-container"> <img src={this.props.src}></img> </div> : '' }
        { this.props.type == constants.VIDEO ? <div className="video-container"> <video width="100%" src={this.props.src} controls> Your browser does not support the video tag. </video> </div> : '' }
      </Card>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.renderMediaFiles = this.renderMediaFiles.bind(this);
    this.handleClickCurtain = this.handleClickCurtain.bind(this);
  }

  handleClickCurtain(team, filename) {
    const config = {
      method: 'POST',
      url: '/media-files/make-stack-file-downloaded',
      data: {
        team,
        filename
      }
    };
    utils.simpleAxios(axios, config).then(() => {
      this.props.makeStackFileDownloaded(team, filename);
    });
  }

  renderMediaFiles(mediaFiles) {
    var list = [];
    for ( var i = 0; i < mediaFiles.length; i++ ) {
      const team = i + 1;
      let files = mediaFiles[i];
      if ( files ) {
        for ( var z = 0; z < files.length; z++ ) {
          const filename = files[z].filename;
          const downloaded = files[z].downloaded;
          var type = utils.mediaTypeCheck(filename); // null도 일단 받자.
          list.push(
            <Col xs="4" key={`${team}-${i}-${z}-${filename}`}>
              <FileItem team={team} src={`/user/uploads/${window.__dcv__}/${team}/${filename}`} filename={filename} type={type} downloaded={downloaded} onClickCurtain={this.handleClickCurtain} ></FileItem>
            </Col>
          );
        }
      }
    }
    return list;
  }

  render() {
    console.log( 'this.props.mediaFiles : ', this.props.mediaFiles );
    return (
      <div className="page container-fluid">
        <h2 className="title">미션 자료 다운로드</h2>
        <div className="guide mb-5">사용법 : 회색 박스를 클릭후 -> 오른쪽마우스 클릭 -> 다른이름으로 저장 / 회색박스는 아직 다운받지 <b>않은</b> 자료를 의미합니다</div>
        <Row>
          { this.renderMediaFiles(this.props.mediaFiles) }
        </Row>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    mediaFiles: state
  };
}

export default connect(mapStateToProps, { makeStackFileDownloaded })(App);