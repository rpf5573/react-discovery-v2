import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { fileTypeCheck, IMAGE, VIDEO } from '../utils';
import cn from 'classnames';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { updateFileInfo, updateProgressVal } from '../actions';
import NoteAdd from '@material-ui/icons/NoteAddOutlined';
import Done from '@material-ui/icons/Done';
import DeleteForever from '@material-ui/icons/DeleteForever';
import LinearProgress from '@material-ui/core/LinearProgress';

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
  }

  async fileSelectHandler(e) {
    const file = e.target.files[0];

    console.log( 'fil : ', file );

    var fileType = fileTypeCheck(file.name);
    if ( fileType == null ) {
      return alert("지원되지 않는 파일 형식입니다");
    }

    // 50MB
    if ( file.size > 52428800 ) {
      return alert("파일 사이즈는 50MB를 넘으면 안됩니다");
    }

    this.props.updateFileInfo({
      src: URL.createObjectURL(file),
      type: fileType
    });
  }

  async uploadFile(e) {
    var result = await this.timerCheck(this.props.ourTeam, this.props.laptime);
    console.log( 'timer check result : ', result );

    if ( ! result.success ) {
      return alert(result.error);
    }

    const file = this.fileUploadInput.current.files[0];
    if ( ! file ) {
      alert( "ERROR : 업로드할 파일이 없습니다" );
    }

    // 이제 여기서 업로드 함.
    const fd = new FormData();
    // 이거를 먼저 써주는게 중요하다. 왜냐하면 서버입장에서는 userFile을 다 받기 전에는 team을 못읽을 수 가 있거든. 
    // http body부분이 엄청 길거 아니냐 ! 근데 team정보가 맨 마지막에 있으면 좀 곤란하지 !
    fd.append('team', this.props.ourTeam);
    fd.append('userFile', file, file.name);
    fd.append('point', this.props.mappingPoints.upload);

    try {
      const response = await axios({
        method: 'POST',
        url: '/user/upload',
        data: fd,
        onUploadProgress: (progressEvent) => {
          let val = Math.floor( (progressEvent.loaded / progressEvent.total) * 100 );
          console.log( 'val : ', val );
          this.props.updateProgressVal(val);
        }
      });
      
      if ( response.status == 201 && !response.data.error ) {
        alert(`성공 : 시간내에 본부에 도착하면, ${this.props.mappingPoints.upload}점이 지급됩니다`);
      } else {
        alert( response.data.error );
      }
    } catch ( error ) {
      console.error( error );
    }

    this.reset();
  }

  async cancelPreview(e) {
    this.reset();
  }

  async timerCheck(team, laptime) {
    try {
      // check timer before upload
      let response = await axios({
        method: "POST",
        url: "/user/timer-check",
        data: {
          team,
          laptime
        }
      });
      if ( response.status == 201 && ! response.data.error ) {
        return { success: true, error: response.data.error };
      } else {
        return { success: false, error: response.data.error };
      }
    } catch(e) {
      console.error(e);
      return { success: false, error: "알수없는 에러가 발생하였습니다" };
    }
  }

  reset() {
    if ( this.fileUploadInput.current ) {
      this.fileUploadInput.current.value = null;
    }

    this.props.updateFileInfo({
      src: null,
      type: null
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
      'preview--image': (this.props.fileInfo.type == IMAGE ? true : false),
      'preview--video': (this.props.fileInfo.type == VIDEO ? true : false)
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
            <NoteAdd className={"note-add-icon"}></NoteAdd>
          </div>
          <div className="l-bottom">
            여기를 눌러 업로드 해주세요
          </div>
        </button>
        <input style={{display: 'none'}} type="file" onChange={this.fileSelectHandler} ref={this.fileUploadInput}></input>
        <div className={previewCN}>
          <img src={this.props.fileInfo.src}></img>
          <video width="100%" src={this.props.fileInfo.src} controls>
            Your browser does not support the video tag.
          </video>
          <div className={checkBtnsCN}>
            <button className="cancel" onClick={this.cancelPreview}>
              <DeleteForever></DeleteForever>
            </button>
            <button className="ok" onClick={this.uploadFile}>
              <Done></Done>
            </button>
          </div>
          { this.props.progressVal > 0 ? <LinearProgress className="progress-bar" variant="determinate" value={this.props.progressVal} /> : '' }
        </div>
      </div>
    );
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