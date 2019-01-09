import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import * as utils from '../../../utils/client';
import * as constants from '../../../utils/constants';
import cn from 'classnames';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { updateFileInfo, updateProgressVal } from '../actions';
import Camera from '@material-ui/icons/CameraAltOutlined';
import Done from '@material-ui/icons/Done';
import DeleteForever from '@material-ui/icons/DeleteForever';
import LinearProgress from '@material-ui/core/LinearProgress';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

class Upload extends Component {

  constructor(props) {
    super(props);

    this.state = {
      progressVal: null
    }

    this.fileUploadInput = React.createRef();
    this.fileSelectHandler = this.fileSelectHandler.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.cancelPreview = this.cancelPreview.bind(this);
    this.reset = this.reset.bind(this);
    this.timerCheck = this.timerCheck.bind(this);
    this.changeVideoSrc = this.changeVideoSrc.bind(this);
  }

  async fileSelectHandler(e) {
    const file = e.target.files[0];
    if ( file ) {
      var mediaType = utils.mediaTypeCheck(file.name);
      if ( mediaType == null ) {
        return alert("지원되지 않는 파일 형식입니다");
      }

      // about 100MB
      if ( file.size > 99428800 ) {
        return alert("파일 사이즈는 100MB를 넘으면 안됩니다");
      }

      const src = URL.createObjectURL(file);
      const type = file.type;

      this.props.updateFileInfo({
        src,
        type,
        mediaType
      });

      // video인경우에 src를 업데이트 해줘야함
      if ( mediaType == constants.VIDEO ) {
        this.changeVideoSrc(src, type);
      } 
      // 일단 안해주면 어떻게 될까 ??
      // else if ( mediaType == constants.IMAGE ) {
      //   this.changeVideoSrc(null, null);
      // }

    } else {
      console.log( 'no file select');
    }
  }

  async uploadFile(e) {
    // timer check first
    let response = await this.timerCheck(this.props.ourTeam, this.props.laptime);
    console.log( 'response : ', response );

    const file = this.fileUploadInput.current.files[0];
    if ( ! file ) {
      return alert( "ERROR : 업로드할 파일이 없습니다" );
    }
    // 이제 여기서 업로드 함.
    const fd = new FormData();
    // 이거를 먼저 써주는게 중요하다. 왜냐하면 서버입장에서는 userFile을 다 받기 전에는 team을 못읽을 수 가 있거든. 
    // http body부분이 엄청 길거 아니냐 ! 근데 team정보가 맨 마지막에 있으면 좀 곤란하지 !
    fd.append('team', this.props.ourTeam);
    fd.append('userFile', file, file.name);
    fd.append('point', this.props.mappingPoints.upload);

    const config = {
      method: 'POST',
      url: '/user/upload',
      data: fd,
      onUploadProgress: (progressEvent) => {
        let val = Math.floor( (progressEvent.loaded / progressEvent.total) * 100 );
        console.log( 'val : ', val );
        this.props.updateProgressVal(val);
      }
    };

    utils.simpleAxios(axios, config, (response) => {
      alert(`성공 !`);
      this.reset();
    });
  }

  async cancelPreview(e) {
    this.reset();
  }

  async timerCheck(team, laptime) {
    const config = {
      method: "POST",
      url: "/user/timer-check",
      data: {
        team,
        laptime
      }
    };
    let result = await utils.simpleAxios(axios, config, (response) => {
      return response;
    });
    console.log( 'result : ', result );
  }

  changeVideoSrc(src, type) {
    this.player.src([{src, type}]);
  }

  reset() {
    if ( this.fileUploadInput.current ) {
      this.fileUploadInput.current.value = null;
    }

    if ( this.props.fileInfo.src ) {
      URL.revokeObjectURL(this.props.fileInfo.src);
    }

    this.props.updateFileInfo({
      src: null,
      type: null,
      mediaType: null
    });

    this.props.updateProgressVal(0);
  }

  render() {
    let uploadBoxCN = cn({
      'upload-box': true,
      'd-none': (this.props.fileInfo.src ? true : false)
    });
    let previewCN = cn({
      'preview': true,
      'd-none': (this.props.fileInfo.src ? false : true),
      'preview--image': (this.props.fileInfo.mediaType == constants.IMAGE ? true : false),
      'preview--video': (this.props.fileInfo.mediaType == constants.VIDEO ? true : false)
    });
    let checkBtnsCN = cn({
      'check-btns': true,
      'slide-left': (this.props.fileInfo.src ? true : false),
      'd-none': (this.props.progressVal > 0 ? true : false ) // 업로드 중일떄는 다른거 또 업로드 못하게 해야지 !
    });

    return (
      <div className="upload-page full-container">
        <button className={uploadBoxCN} onClick={() => this.fileUploadInput.current.click()}>
          <div className="l-top">
            <Camera className={"note-add-icon"}></Camera>
          </div>
          <div className="l-bottom">
            여기를 눌러 촬영 및 업로드 해주세요
          </div>
        </button>
        <input style={{display: 'none'}} type="file" onChange={this.fileSelectHandler} ref={this.fileUploadInput}></input>
        <div className={previewCN}>
          <img src={this.props.fileInfo.src}></img>
          <div className="videoPlayer">
            <div data-vjs-player>
              <video ref={ node => this.videoNode = node } className="video-js"></video>
            </div>
          </div>
          <div className={checkBtnsCN}>
            <button className="cancel" onClick={this.cancelPreview}>
              <DeleteForever></DeleteForever>
              <span>취소</span>
            </button>
            <button className="ok" onClick={this.uploadFile}>
              <Done></Done>
              <span>업로드</span>
            </button>
          </div>
          { this.props.progressVal > 0 ? <LinearProgress className="progress-bar" variant="determinate" value={this.props.progressVal} /> : '' }
        </div>
      </div>
    );
  }

  componentWillUnmount() {

    // 만약에 업로드 중이 아니라면, reset시켜버리자
    if ( ! this.props.progressVal ) {
      this.reset();
    }

    // player 메모리에서 떼어내야되 왜냐면, 어차피 ComponentDidMount에서 다시 회복될꺼니까 !!
    if (this.player) {
      this.player.dispose();
    }
  }

  componentDidMount() {
    const config = {
      controls: true,
      controlBar: {
        fullscreenToggle: false
      }
    };
    if ( this.props.fileInfo.mediaType == constants.VIDEO && this.props.fileInfo.src ) {
      config.sources = [{src: this.props.fileInfo.src, type: this.props.fileInfo.type}];
    }
    this.player = videojs(this.videoNode, config, function onPlayerReady() {
      console.log('onPlayerReady', this);
    });
  }
}

function mapStateToProps(state, ownProps) {
  return {
    ourTeam: ( state.loginData ? state.loginData.team : false ),
    mappingPoints: state.mapping_points,
    fileInfo: state.fileInfo,
    progressVal: state.progressVal,
    laptime: state.laptime
  };
}

export default connect(mapStateToProps, { updateFileInfo, updateProgressVal })(Upload);