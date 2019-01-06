import * as utils from '../../../utils/client';
import React from 'react';
import { Button } from 'reactstrap';
import axios from 'axios';
import cn from 'classnames';

class PostInfoRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      mission: this.props.postInfo.mission,
      googleDriveURL: this.props.postInfo.googleDriveURL,  // naming 지못미...
      isNew: (this.props.onCancelAdd ? true : false),
    }

    this.missionInput = React.createRef();
    this.googleDriveURLInput = React.createRef();

    this.handleEditBtnClick = this.handleEditBtnClick.bind(this);
    this.handleRemoveBtnClick = this.handleRemoveBtnClick.bind(this);
    this.handleCancelBtnClick = this.handleCancelBtnClick.bind(this);
    this.handleAddBtnClick = this.handleAddBtnClick.bind(this);
    this.handleUpdateBtnClick = this.handleUpdateBtnClick.bind(this);
  }

  handleEditBtnClick(e) {
    this.setState({
      isEditing: true
    });
  }

  handleCancelBtnClick(e) {
    if ( this.state.isNew ) {
      this.props.onCancelAdd();
      return;
    }

    this.setState({
      isEditing: false
    });
    this.googleDriveURLInput.current.value = '';
  }

  async handleRemoveBtnClick(e) {
    const config = {
      method: 'POST',
      url: '/warehouse/post-info/remove',
      data: {
        mission: this.state.mission
      }
    };
    utils.simpleAxios(axios, config, (response) => {
      this.props.onRemove(this.state.mission);
      alert("성공");
    });
  }

  async handleAddBtnClick(e) {
    let mission = this.missionInput.current.value;
    if ( !mission ) {
      return alert( 'ERROR : 미션을 설정해 주시기 바랍니다' );
    }

    if ( ! this.props.validateAdd(mission) ) {
      return alert("해당 미션은 이미 존재합니다");
    }

    let googleDriveURL = this.googleDriveURLInput.current.value;
    if ( !googleDriveURL ) {
      alert( 'ERROR : 구글드라이브 주소를 입력해 주시기 바랍니다' );
      return;
    }

    if ( ! utils.isValidURL(googleDriveURL) ) {
      alert( "ERROR : 입력한 구글드라이브 주소를 다시한번 확인해 주세요" );
      return;
    }

    let postInfo = {
      mission,
      googleDriveURL
    };

    const config = {
      method: 'POST',
      url: '/warehouse/post-info/insert',
      data: {
        postInfo
      }
    };

    utils.simpleAxios(axios, config, (response) => {
      this.props.onAdd(postInfo);
      alert("성공");
    });
  }

  async handleUpdateBtnClick(e) {
    let googleDriveURL = this.googleDriveURLInput.current.value;
    if ( !googleDriveURL ) {
      alert( 'ERROR : 구글드라이브 주소를 입력해 주시기 바랍니다' );
      return;
    }

    if ( ! utils.isValidURL(googleDriveURL) ) {
      alert( "ERROR : 입력한 구글드라이브 주소를 다시한번 확인해 주세요" );
      return;
    }

    let postInfo = {
      mission: this.state.mission,
      googleDriveURL
    };

    const config = {
      method: 'POST',
      url: '/warehouse/post-info/update',
      data: {
        postInfo
      }
    };

    utils.simpleAxios(axios, config, (response) => {
      this.props.onUpdate(postInfo);
      alert("성공");
    });
  }

  async handleApplyBtnClick(e) {

    if ( this.state.isNew ) {
      let mission = this.missionInput.current.value;
      if ( !mission ) {
        alert( 'ERROR : 미션을 설정해 주시기 바랍니다' );
        return;
      }

      if ( ! this.props.validateAdd ) {
        return alert("해당 미션은 이미 존재합니다");
      }
    }

    let googleDriveURL = this.googleDriveURLInput.current.value;
    if ( !googleDriveURL ) {
      alert( 'ERROR : 구글드라이브 주소를 입력해 주시기 바랍니다' );
      return;
    }

    if ( ! utils.isValidURL(googleDriveURL) ) {
      alert( "ERROR : 입력한 구글드라이브 주소를 다시한번 확인해 주세요" );
      return;
    }

    let postInfo = {
      mission,
      googleDriveURL
    };

    const config = {
      method: 'POST',
      url: `/warehouse/post-info/${this.state.isNew ? 'insert' : 'update'}`,
      data: {
        postInfo
      }
    };

    utils.simpleAxios(axios, config, (response) => {
      if ( this.state.isNew ) {
        this.props.onAdd(postInfo);
      } else {
        this.props.onUpdate(postInfo);
      }
      alert("성공");
    });
  }

  render() {
    return (
      <tr className="post-info-row">
        <td>
          <span className={ cn({ 'd-none': this.state.isNew }) }>{this.state.mission}</span>
          <input className={cn({
            'form-control': true,
            'd-block': this.state.isNew,
          })} ref={this.missionInput}></input>
        </td>
        <td>
          <span className={ cn({ 'd-none': (this.state.isEditing || this.state.isNew ) }) }>{this.state.googleDriveURL}</span>
          <input className={cn({
            'form-control': true,
            'd-block': (this.state.isEditing || this.state.isNew)
          })} ref={this.googleDriveURLInput}></input>
        </td>
        <td>
          <Button size="sm" outline color="success" className={cn({ 'mr-2': true, 'd-none': (this.state.isEditing || this.state.isNew) })} onClick={this.handleEditBtnClick}>수정</Button>
          <Button size="sm" outline color="danger" className={cn({ 'd-none': (this.state.isEditing || this.state.isNew) })} onClick={this.handleRemoveBtnClick}>삭제</Button>
          <Button size="sm" outline color="secondary" className={cn({ 'cancel-btn': true, 'd-inline-block': (this.state.isEditing || this.state.isNew), 'mr-2': true })} onClick={this.handleCancelBtnClick}>취소</Button>
          <Button size="sm" outline color="primary" className={cn({ 'apply-btn': true, 'd-inline-block': (this.state.isEditing || this.state.isNew) })} onClick={ this.state.isNew ? this.handleAddBtnClick : this.handleUpdateBtnClick }>적용</Button>
        </td>
      </tr>
    );
  }
}

export default PostInfoRow;