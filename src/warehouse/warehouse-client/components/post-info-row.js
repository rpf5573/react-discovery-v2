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
      id: this.props.postInfo.id,
      mission: this.props.postInfo.mission,
      url: this.props.postInfo.url,  // naming 지못미...
      isNew: (this.props.onCancelAdd ? true : false),
    }

    this.missionInput = React.createRef();
    this.urlInput = React.createRef();

    this.handleEditBtnClick = this.handleEditBtnClick.bind(this);
    this.handleRemoveBtnClick = this.handleRemoveBtnClick.bind(this);
    this.handleCancelBtnClick = this.handleCancelBtnClick.bind(this);
    this.handleApplyBtnClick = this.handleApplyBtnClick.bind(this);
    this.handleAddComplete = this.handleAddComplete.bind(this);
    this.handleEditComplete = this.handleEditComplete.bind(this);
    this.validateEmpty = this.validateEmpty.bind(this);
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

    this.missionInput.current.value = this.state.mission;
    this.urlInput.current.value = this.state.url;
  }

  async handleRemoveBtnClick(e) {
    const config = {
      method: 'POST',
      url: '/warehouse/post-infos/remove',
      data: {
        id: this.state.id
      }
    };
    utils.simpleAxios(axios, config).then(() => {
      this.props.onRemove(this.state.id);
      alert("성공");
    });
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
    let postInfo = this.validateEmpty();

    if ( ! postInfo ) {
      return;
    }
    const config = {
      method: 'POST',
      url: '/warehouse/post-infos/add',
      data: {
        postInfo
      }
    };

    utils.simpleAxios(axios, config).then((response) => {
      postInfo.id = response.data.id;
      this.props.onAdd(postInfo);
      alert("성공");
    });
  }

  async handleEditComplete() {
    let postInfo = this.validateEmpty();
    if ( ! postInfo ) {
      return;
    }
    postInfo.id = this.state.id;
    const config = {
      method: 'POST',
      url: '/warehouse/post-infos/edit',
      data: {
        postInfo
      }
    };

    utils.simpleAxios(axios, config).then(() => {
      this.props.onEdit(postInfo);
      alert("성공");
    });
  }

  validateEmpty() {
    let mission = this.missionInput.current.value;
    if ( !mission ) {
      alert( 'ERROR : 미션을 설정해 주시기 바랍니다' );
      return false;
    }

    let url = this.urlInput.current.value;
    if ( !url ) {
      alert( 'ERROR : 구글드라이브 주소를 입력해 주시기 바랍니다' );
      return false;
    }

    if ( ! utils.isValidURL(url) ) {
      alert( "ERROR : 입력한 구글드라이브 주소를 다시한번 확인해 주세요" );
      return false;
    }

    return { mission, url };
  }

  render() {
    return (
      <tr className="post-info-row">
        <td>
          <span className={ cn({ 'd-none': (this.state.isEditing || this.state.isNew) }) }>{this.state.mission}</span>
          <input className={cn({
            'form-control': true,
            'd-block': (this.state.isEditing || this.state.isNew)
          })} ref={this.missionInput} defaultValue={this.state.isEditing ? this.state.mission : ''}></input>
        </td>
        <td>
          <span className={ cn({ 'd-none': (this.state.isEditing || this.state.isNew) }) }>{this.state.url}</span>
          <input className={cn({
            'form-control': true,
            'd-block': (this.state.isEditing || this.state.isNew)
          })} ref={this.urlInput} defaultValue={this.state.isEditing ? this.state.url : ''}></input>
        </td>
        <td>
          <Button size="sm" outline color="success" className={cn({ 'mr-2': true, 'd-none': (this.state.isEditing || this.state.isNew) })} onClick={this.handleEditBtnClick}>수정</Button>
          <Button size="sm" outline color="danger" className={cn({ 'd-none': (this.state.isEditing || this.state.isNew) })} onClick={this.handleRemoveBtnClick}>삭제</Button>
          <Button size="sm" outline color="secondary" className={cn({ 'cancel-btn': true, 'd-inline-block': (this.state.isEditing || this.state.isNew), 'mr-2': true })} onClick={this.handleCancelBtnClick}>취소</Button>
          <Button size="sm" outline color="primary" className={cn({ 'apply-btn': true, 'd-inline-block': (this.state.isEditing || this.state.isNew) })} onClick={ this.handleApplyBtnClick }>적용</Button>
        </td>
      </tr>
    );
  }
}

export default PostInfoRow;