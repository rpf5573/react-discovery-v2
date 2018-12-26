import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { getFileExtension } from '../utils';
import fileExtensions from '../file-extensions';
import cn from 'classnames';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import { updatePreviewImage } from '../actions';
import NoteAdd from '@material-ui/icons/NoteAddOutlined';
import Done from '@material-ui/icons/Done';
import DeleteForever from '@material-ui/icons/DeleteForever';

class Upload extends Component {

  constructor(props) {
    super(props);

    this.state = {
      fileType: 'image',
      imgSrc: null
    }
    this.fileUploadInput = React.createRef();
    this.fileSelectHandler = this.fileSelectHandler.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.cancelPreview = this.cancelPreview.bind(this);
  }

  async fileSelectHandler(e) {
    const file = e.target.files[0];
    var reader = new FileReader();
    reader.onloadend = () => {
      this.props.updatePreviewImage(reader.result);
    };
    var url = reader.readAsDataURL(file);
    console.log(url) // Would see a path?
  }

  async uploadFile(e) {
    const file = this.fileUploadInput.current.files[0];

    var validationPass = false;

    // file 확장자명 체크
    const extension = getFileExtension(file.name);
    for ( var i = 0; i < fileExtensions.image.length; i++ ) {
      if ( extension == fileExtensions.image[i] ) {
        this.setState({
          fileType: 'image'
        });
        validationPass = true;
      }
    }

    if ( !validationPass ) {
      for ( var i = 0; i < fileExtensions.video.length; i++ ) {
        if ( extension == fileExtensions.video[i] ) {
          this.setState({
            fileType: 'video'
          });
          validationPass = true;
        }
      } 
    }

    if ( !validationPass ) {
      alert( "ERROR : 해당 파일은 업로드할 수 없습니다" );
      return;
    }

    // 이제 여기서 업로드 함.
    const fd = new FormData();
    // 이거를 먼저 써주는게 중요하다. 왜냐하면 서버입장에서는 userFile을 다 받기 전에는 team을 못읽을 수 가 있거든. 
    // http body부분이 엄청 길거 아니냐 ! 근데 team정보가 맨 마지막에 있으면 좀 곤란하지 !
    fd.append('team', 3);
    fd.append('userFile', file, file.name);
    fd.append('point', this.props.mappingPoints.upload);

    try {
      const response = await axios({
        method: 'POST',
        url: '/user/upload',
        data: fd
      });
      
      if ( response.status == 201 && !response.data.error ) {
        // this.props.uploadFile({
        //   companyImage: companyImage.name
        // });
        alert("성공");
      } else {
        alert( response.data.error );
      }
    } catch ( error ) {
      console.error( error );
    }
  }

  async cancelPreview(e) {
    this.props.updatePreviewImage(null);
  } 

  render() {
    let uploadBoxCN = cn({
      'upload-box': true,
      'd-none': (this.props.imgSrc ? true : false)
    });
    let previewCN = cn({
      'preview': true,
      'd-none': (this.props.imgSrc ? false : true),
      'slide-left': (this.props.imgSrc ? true : false),
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
          <img src={this.props.imgSrc}></img>
          <div className="check-btns">
            <button className="cancel" onClick={this.cancelPreview}>
              <DeleteForever></DeleteForever>
            </button>
            <button className="ok" onClick={this.uploadFile}>
              <Done></Done>
            </button>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  console.log( 'state : ', state );
  return {
    ourTeam: ( state.loginData ? state.loginData.team : false ),
    mappingPoints: state.mapping_points,
    imgSrc: state.previewImgSrc
  };
}

export default connect(mapStateToProps, { updatePreviewImage })(Upload);