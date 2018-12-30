import * as utils from '../../../../utils';
import React from 'react';
import { connect } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Input, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, InputGroup, InputGroupAddon, InputGroupText, FormGroup, Label, ButtonGroup, Table } from 'reactstrap';
import { closeModal, updatePostInfo, addPostInfo, removePostInfo } from '../../actions';
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
    this.missionInput.current.value = '';
    this.googleDriveURLInput.current.value = '';
  }

  async handleRemoveBtnClick(e) {
    try {
      let response = await axios({
        method: 'POST',
        url: '/admin/post-info/remove',
        data: {
          post: this.state.post
        }
      });
      if ( response.status == 201 && !response.data.error ) {
        this.props.onRemove(this.state.post);
        alert("성공");
      } else {
        alert( response.data.error );
      }
    } catch(error) {
      console.error(error);
    }
    
  }

  async handleApplyBtnClick(e) {
    var post = this.state.post;
    if ( this.state.isNew ) {
      post = parseInt(this.postInput.current.value);
      if ( isNaN(post) || !post ) {
        alert( 'ERROR : 포스트를 설정해 주시기 바랍니다' );
        return;
      }

      if ( ! this.props.validateAdd(post) ){
        alert( 'ERROR : 해당 포스트는 이미 존재합니다' );
        return;
      }
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

    if ( ! isValidURL(googleDriveURL) ) {
      alert( "ERROR : 입력한 구글드라이브 주소를 다시한번 확인해 주세요" );
      return;
    }

    let postInfo = {
      post,
      mission,
      googleDriveURL
    }

    try {
      let response = await axios({
        method: 'POST',
        url: '/admin/post-info/update-or-insert',
        data: {
          postInfo
        }
      });
      if ( response.status == 201 && !response.data.error ) {
        if ( this.state.isNew ) {
          this.props.onAdd(postInfo);
        } else {
          this.props.onUpdate(postInfo);
        }
        
        this.setState({
          isEditing: false,
          isNew: false,
          post,
          mission,
          googleDriveURL
        });

        this.missionInput.current.value = null;
        this.googleDriveURLInput.current.value = null;

        alert("성공");

      } else {
        alert( response.data.error );
      }
    } catch(error) {
      console.error(error);
    }
  }

  render() {
    return (
      <tr className="post-info-row">
        <td>
          <span>{this.state.post}</span>
          <input type="number" className={cn({
            'form-control': true,
            'd-block': this.state.isNew
          })} ref={this.postInput}></input>
        </td>
        <td>
          <span className={ cn({ 'd-none': (this.state.isEditing || this.state.isNew) }) }>{this.state.mission}</span>
          <input className={cn({
            'form-control': true,
            'd-block': (this.state.isEditing || this.state.isNew)
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
          <Button size="sm" outline color="primary" className={cn({ 'apply-btn': true, 'd-inline-block': (this.state.isEditing || this.state.isNew) })} onClick={this.handleApplyBtnClick}>적용</Button>
        </td>
      </tr>
    );
  }
}

class PostInfoModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      backdrop: true,
      emptyRow: false,
      newRows: 0
    }
    this.close = this.close.bind(this);
    this.handleAdd = this.handleAdd.bind(this);
    this.handleCancelAdd = this.handleCancelAdd.bind(this);
    this.renderNewRows = this.renderNewRows.bind(this);
    this.validateAdd = this.validateAdd.bind(this);
    this.onAdd = this.onAdd.bind(this);
  }

  close() {
    this.props.closeModal();
  }

  handleAdd(e) {
    this.setState({
      newRows: this.state.newRows+1
    });
  }

  handleCancelAdd(e) {
    this.setState({
      newRows: this.state.newRows - 1
    })
  }

  validateAdd(post) {
    for( var i = 0; i < this.props.postInfos.length; i++ ) {
      if ( post == this.props.postInfos[i].post ) {
        return false;
      }
    }
    return true;
  }

  onAdd(postInfo) {
    this.setState({
      newRows: this.state.newRows - 1
    });
    this.props.addPostInfo(postInfo);
  }

  renderNewRows(count) {
    var newRows= [];
    let emptyPostInfo = {
      post: null,
      mission: null,
      googleDriveURL: null
    }
    for ( var i = 0; i < count; i++ ) {
      newRows.push(
        <PostInfoRow 
          key={i}
          postInfo={emptyPostInfo}
          onAdd={this.onAdd}
          onUpdate={this.props.updatePostInfo}
          onRemove={this.props.removePostInfo}
          onCancelAdd={this.handleCancelAdd} 
          validateAdd={this.validateAdd}></PostInfoRow>
      );
    }
    return newRows;
  }

  render() {
    return (
      <Modal style={{maxWidth: '1100px'}} isOpen={ (this.props.activeModalClassName == this.props.className) ? true : false } toggle={this.close} className={this.props.className}>
        <ModalHeader toggle={this.close}>
          포스트 정보 동영상 등록
        </ModalHeader>
        <ModalBody>
          <Table>
            <thead>
              <tr>
                <td style={{'width': '10%'}}>
                  포스트
                </td>
                <td style={{'width': '15%'}}>
                  미션
                </td>
                <td style={{'width': '60%'}}>
                  구글 드라이브 주소
                </td>
                <td style={{'width': '15%'}}></td>
              </tr>
            </thead>
            <tbody>
              { this.props.postInfos.map((postInfo, i) =>
                <PostInfoRow
                  key={postInfo.post}
                  postInfo={postInfo} 
                  onUpdate={this.props.updatePostInfo} 
                  onRemove={this.props.removePostInfo} ></PostInfoRow> ) }
              { this.renderNewRows(this.state.newRows) }
            </tbody>
          </Table>
          <Row>
            <Col xs="12">
              <Button color="primary" block onClick={this.handleAdd}>추가</Button>
            </Col>
          </Row>
        </ModalBody>
      </Modal>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    activeModalClassName: state.modalControl.activeModalClassName,
    postInfos: state.postInfos
  };
}

export default connect(mapStateToProps, { closeModal, updatePostInfo, addPostInfo, removePostInfo })(PostInfoModal);