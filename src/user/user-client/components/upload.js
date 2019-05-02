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

// React Modal
import Modal from 'react-modal';

Modal.setAppElement('#app');
Modal.defaultStyles.content = {};
Modal.defaultStyles.overlay.backgroundColor = '';
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
    this.uploadFile = this.uploadFile.bind(this);
    this.cancelPreview = this.cancelPreview.bind(this);
    this.reset = this.reset.bind(this);
    this.timerCheck = this.timerCheck.bind(this);
    this.changeVideoSrc = this.changeVideoSrc.bind(this);
    this.uploadTimeIntervalCheck = this.uploadTimeIntervalCheck.bind(this);
    this.openModal = this.openModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.renderModal = this.renderModal.bind(this);
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

  async uploadFile(e) {

    // 타이머 시간이 경과했는지 체크
    let result = await this.timerCheck(this.props.ourTeam, this.props.laptime);
    if ( result.data.error ) {
      this.openModal(false, result.data.error, false, ()=>{
        this.closeModal();
      });
      return;
    }
    
    // 업로드 한지 1분이 지났는지 안지났는지 체크
    result = await this.uploadTimeIntervalCheck(this.props.ourTeam);
    if ( result.data.error ) {
      this.openModal(false, result.data.error, false, ()=>{
        this.closeModal();
      });
      return;
    }

    // 이제 업로드 시작
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

    var config = {
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

    utils.simpleAxios(axios, config, false).then((response) => {
      if ( response.data.error ) {
        this.openModal(false, response.data.error, false, ()=>{ this.closeModal(); });  
      }
      this.openModal(false, '성공', ()=>{ this.reset(); }, false);
    }).catch((e) => {
      this.openModal(false, e, false, ()=>{ this.closeModal(); });
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
    let result = utils.simpleAxios(axios, config);
    return result;
  }

  async uploadTimeIntervalCheck(team) {
    // 업로드 한지 1분 지났는지 테스트
    const config = {
      method: 'POST',
      url: '/user/upload-interval-check',
      data: {
        team
      },
    };

    let result = await utils.simpleAxios(axios, config);
    return result;
  }

  changeVideoSrc(src, type) {
    this.player.src([{src, type}]);
  }

  openModal(header=false, body=false, onPositive=false, onNegative=false) {
    const modalState = {
      isOpen: true,
      header,
      body,
      onPositive,
      onNegative
    };
    this.setState({modal: modalState});
  }

  closeModal() {
    const modalState = {...this.state.modal};
    modalState.isOpen = false;
    this.setState({modal: modalState});
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

  renderModal() {
    const header = this.state.modal.header ? <h3>{this.state.modal.header}</h3> : '';
    const body = this.state.modal.body ? <p>{this.state.modal.body}</p> : '';
    const positiveBtn = this.state.modal.onPositive ? <button className="alertModal__positiveBtn" onClick={this.state.modal.onPositive}>확인</button> : '';
    const negativeBtn = this.state.modal.onNegative ? <button className="alertModal__negativeBtn" onClick={this.state.modal.onNegative}>취소</button> : '';

    return (
      <Modal
        isOpen={this.state.modal.isOpen}>
        <div className="alertModal">
          {header}
          {body}
          <div className="alertModal__btnContainer">
            {positiveBtn}
            {negativeBtn}
          </div>
        </div>
      </Modal>
    );
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
            <button className="ok" onClick={this.uploadFile}>
              <Done></Done>
              <span>업로드</span>
            </button>
          </div>
          { this.props.progressVal > 0 ? <LinearProgress className="progress-bar" variant="determinate" value={this.props.progressVal} /> : '' }
        </div>
        {this.renderModal()}
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
    laptime: state.laptime
  };
}

export default connect(mapStateToProps, { updateFileInfo, updateProgressVal })(Upload);