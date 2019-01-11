import * as utils from '../../../../utils/client';
import React from 'react';
import { Button } from 'reactstrap';
import axios from 'axios';
import cn from 'classnames';

class PostInfoRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      post: this.props.postInfo.post,
      mission: this.props.postInfo.mission,
      googleDriveURL: this.props.postInfo.googleDriveURL,  // naming 지못미...
      isNew: (this.props.onCancelAdd ? true : false),
    }

    this.postInput = React.createRef();
    this.missionInput = React.createRef();
    this.googleDriveURLInput = React.createRef();

    this.handleEditBtnClick = this.handleEditBtnClick.bind(this);
    this.handleRemoveBtnClick = this.handleRemoveBtnClick.bind(this);
    this.handleCancelBtnClick = this.handleCancelBtnClick.bind(this);
    this.handleApplyBtnClick = this.handleApplyBtnClick.bind(this);
    this.handleAddComplete = this.handleAddComplete.bind(this);
    this.handleEditComplete = this.handleEditComplete.bind(this);
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
    this.postInput.current.value = '';
    this.missionInput.current.value = '';
    this.googleDriveURLInput.current.value = '';
  }

  async handleRemoveBtnClick(e) {
    const config = {
      method: 'POST',
      url: '/admin/post-info/remove',
      data: {
        post: this.state.post
      }
    };
    let response = await utils.simpleAxios(axios, config);
    this.props.onRemove(this.state.post);
    alert("성공");
  }

  async handleApplyBtnClick(e) {
    if ( this.state.isNew ) {
      this.handleAddComplete();
    }
    else if ( this.state.isEditing ) {
      this.handleEditComplete();
    } else {
      alert( "ERROR - 알수없는 동작입니다" );
    }
  }

  async handleAddComplete() {
    const post = parseInt(this.postInput.current.value);
    if ( isNaN(post) || !post ) {
      alert( 'ERROR : 포스트를 설정해 주시기 바랍니다' );
      return;
    }

    if ( ! this.props.validatePostDuplication(post) ){
      alert( 'ERROR : 해당 포스트는 이미 존재합니다' );
      return;
    }
  
    let mission = this.missionInput.current.value;
    if ( !mission ) {
      alert( 'ERROR : 미션을 설정해 주시기 바랍니다' );
      return;
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
      post,
      mission,
      googleDriveURL
    }

    const config = {
      method: 'POST',
      url: '/admin/post-info/add',
      data: {
        postInfo
      }
    };

    await utils.simpleAxios(axios, config);
    this.props.onAdd(postInfo);

    alert("성공");
  }

  async handleEditComplete() {
    const originalPost = this.state.post;
    const post = parseInt(this.postInput.current.value);
    if ( isNaN(post) || !post ) {
      alert( 'ERROR : 포스트를 설정해 주시기 바랍니다' );
      return;
    }

    // 기존에 입력한거랑 다르면서 , 다른 포스트랑 같다면 ! => 에러가 있는거지 !
    if ( (originalPost != post) && ! this.props.validatePostDuplication(post) ) {
      alert( 'ERROR : 해당 포스트는 이미 존재합니다' );
      return;
    }
  
    let mission = this.missionInput.current.value;
    if ( !mission ) {
      alert( 'ERROR : 미션을 설정해 주시기 바랍니다' );
      return;
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
      originalPost,
      post,
      mission,
      googleDriveURL
    }

    const config = {
      method: 'POST',
      url: '/admin/post-info/edit',
      data: {
        postInfo
      }
    };

    await utils.simpleAxios(axios, config);
    this.props.onEdit(postInfo);
    
    alert("성공");
  }

  render() {
    return (
      <tr className="post-info-row">
        <td>
          <span className={ cn({ 'd-none': (this.state.isEditing || this.state.isNew) }) }>{this.state.post}</span>
          <input type="number" className={cn({
            'form-control': true,
            'd-block': (this.state.isEditing || this.state.isNew)
          })} ref={this.postInput} defaultValue={ this.state.isEditing ? this.state.post : '' }></input>
        </td>
        <td>
          <span className={ cn({ 'd-none': (this.state.isEditing || this.state.isNew) }) }>{this.state.mission}</span>
          <input className={cn({
            'form-control': true,
            'd-block': (this.state.isEditing || this.state.isNew)
          })} ref={this.missionInput} defaultValue={ this.state.isEditing ? this.state.mission : '' }></input>
        </td>
        <td>
          <span className={ cn({ 'd-none': (this.state.isEditing || this.state.isNew ) }) }>{this.state.googleDriveURL}</span>
          <input className={cn({
            'form-control': true,
            'd-block': (this.state.isEditing || this.state.isNew)
          })} ref={this.googleDriveURLInput} defaultValue={ this.state.isEditing ? this.state.googleDriveURL : '' }></input>
        </td>
        <td>
          <Button size="sm" outline color="success" className={cn({ 'mr-2': true, 'd-none': (this.state.isEditing || this.state.isNew) })} onClick={this.handleEditBtnClick}>수정</Button>
          <Button size="sm" outline color="danger" className={cn({ 'd-none': (this.state.isEditing || this.state.isNew) })} onClick={this.handleRemoveBtnClick}>삭제</Button>
          <Button size="sm" outline color="secondary" className={cn({ 'cancel-btn': true, 'd-inline-block': (this.state.isEditing || this.state.isNew), 'mr-2': true })} onClick={this.handleCancelBtnClick}>취소</Button>
          <Button size="sm" outline color="primary" className={cn({ 'apply-btn': true, 'd-inline-block': (this.state.isEditing || this.state.isNew) })} onClick={this.handleApplyBtnClick}>적용</Button>
        </td>
      </tr>
    );
  }
}

export default PostInfoRow;