import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import * as utils from '../../../utils/client';
import * as constants from '../../../utils/constants';
import cn from 'classnames';
import axios from 'axios';
import { updateFileInfo, updateProgressVal } from '../actions';
import Camera from '@material-ui/icons/CameraAltOutlined';
import Done from '@material-ui/icons/Done';
import DeleteForever from '@material-ui/icons/DeleteForever';
import LinearProgress from '@material-ui/core/LinearProgress';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import * as loadImage from 'blueimp-load-image';

class Upload extends Component {

  constructor(props) {
    super(props);

    this.state = {
      progressVal: null,
      modal: {
        isOpen: false,
        header: '',
        body: '',
        onPositive: false,
        onNegative: false
      }
    }

    this.fileUploadInput = React.createRef();
    this.fileSelectHandler = this.fileSelectHandler.bind(this);
    this.uploadWithCheckes = this.uploadWithCheckes.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.cancelPreview = this.cancelPreview.bind(this);
    this.reset = this.reset.bind(this);
    this.changeVideoSrc = this.changeVideoSrc.bind(this);
    this.intervalCheck = this.intervalCheck.bind(this);
    this.timerCheck = this.timerCheck.bind(this);

    console.log( 'this.props.tempBoxState : ', this.props.tempBoxState );
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

      const type = file.type;

      // video인경우에 src를 업데이트 해줘야함
      if ( mediaType == constants.VIDEO ) {
        const src = URL.createObjectURL(file);
        this.props.updateFileInfo({
          src,
          type,
          mediaType
        });

        this.changeVideoSrc(src, type);
      }
      // image인경우에는 이미지 돌려서 다시 해야함
      else if ( mediaType == constants.IMAGE ) {
        loadImage(file, (canvas) => {
          this.props.updateFileInfo({
            src: canvas.toDataURL(),
            type,
            mediaType
          });
        }, { canvas: true, orientation: true });
      }
    } else {
      console.log( 'no file select');
    }
  }

  async uploadFile() {
    // 이제 업로드 시작
    const file = this.fileUploadInput.current.files[0];
    if ( !file ) {
      this.props.openAlertModal(true, 'error', '업로드할 파일이 없습니다', false, this.props.closeAlertModal);
      return;
    }
    // 이제 여기서 업로드 함.
    const fd = new FormData();
    // 이거를 먼저 써주는게 중요하다. 왜냐하면 서버입장에서는 userFile을 다 받기 전에는 team을 못읽을 수 가 있거든. 
    // http body부분이 엄청 길거 아니냐 ! 근데 team정보가 맨 마지막에 있으면 좀 곤란하지 !
    fd.append('team', this.props.ourTeam);
    fd.append('tempBoxState', this.props.tempBoxState);
    fd.append('userFile', file, file.name);
    fd.append('point', this.props.mappingPoints.upload);

    let config = {
      method: 'POST',
      url: '/user/upload',
      data: fd,
      onUploadProgress: (progressEvent) => {
        let val = Math.floor( (progressEvent.loaded / progressEvent.total) * 100 );
        if ( val%10 == 0 || val > 97 ) {
          this.props.updateProgressVal(val);
        }
      }
    };

    axios(config).then(response => {
      if ( response.data.error ) {
        this.props.openAlertModal(true, 'error', response.data.error, false, this.props.closeAlertModal);
        return;
      }
      this.props.openAlertModal(false, false, '업로드 성공',() => { 
        this.props.closeAlertModal(); 
        this.reset(); 
      }, false);
    }).catch(e => {
      this.props.openAlertModal(true, 'error', e, false, this.props.closeAlertModal);
    });
  }

  async uploadWithCheckes(e) {
    if ( this.props.tempBoxState ) {
      this.timerCheck(() => {
        this.intervalCheck(() => {
          this.uploadFile();
        })
      });
    } else {
      this.intervalCheck(() => {
        this.uploadFile();
      });
    }
  }

  async cancelPreview(e) {
    this.reset();
  }

  intervalCheck(callback) {
    let config = {
      method: 'POST',
      url: '/user/upload-interval-check',
      data: {
        team: this.props.ourTeam
      },
    };
    // 업로드 한지 3분이 지났는지 안지났는지 체크
    axios(config).then(response => {
      if (response.data.error) {
        this.props.openAlertModal(true, 'error', response.data.error, false, this.props.closeAlertModal);
        return;
      }
      callback();
    }).catch(e => {
      this.props.openAlertModal(true, 'error', e, false, this.props.closeAlertModal);
    })
  }

  timerCheck(callback) {
    let config = {
      method: 'POST',
      url: '/user/timer-check',
      data: {
        team: this.props.ourTeam,
        laptime: this.props.laptime
      },
    };
    axios(config).then(response => {
      console.log( 'response.data : ', response.data );
      if ( response.data.error ) {
        console.log( 'response.data.error', ' is called' );
        this.props.openAlertModal(true, 'error', response.data.error, false, this.props.closeAlertModal);
        return;
      }
      console.log( "Did I called ?" );
      callback();
    }).catch(e => {
      this.props.openAlertModal(true, 'error', e, false, this.props.closeAlertModal);
    });
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

    if ( this.player ) {
      this.player.reset();
    }
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

            <div className="notice">
              <h4>주의</h4>
              <ol>
                <li>
                  동영상 촬영시 화질을 <span className="blue">최저</span>로 낮춰주세요.
                </li>
                <li>
                  동영상은 1분 이내로 찍어주시기 바랍니다
                </li>
              </ol>
            </div>
          </div>
        </button>
        <input style={{display: 'none'}} type="file" onChange={this.fileSelectHandler} ref={this.fileUploadInput}></input>
        <div className={previewCN}>
          <div className="imageCanvas" ref={(ref) => this.imageCanvas = ref}>
            <img src={this.props.fileInfo.src}></img>
          </div>
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
            <button className="ok" onClick={this.uploadWithCheckes}>
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
    });
  }

}

function mapStateToProps(state, ownProps) {
  return {
    ourTeam: ( state.loginData ? state.loginData.team : false ),
    mappingPoints: state.mappingPoints,
    fileInfo: state.fileInfo,
    progressVal: state.progressVal,
    laptime: state.laptime,
    tempBoxState: state.tempBoxState
  };
}

export default connect(mapStateToProps, { updateFileInfo, updateProgressVal })(Upload);