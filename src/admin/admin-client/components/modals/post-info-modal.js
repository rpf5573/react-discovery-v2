import * as utils from '../../../../utils/client';
import React from 'react';
import { connect } from 'react-redux';
import { Button, Modal, ModalHeader, ModalBody, Row, Col, Table } from 'reactstrap';
import { closeModal, updatePostInfo, addPostInfo, removePostInfo } from '../../actions';
import PostInfoRow from './post-info-row';

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
    this.validatePostDuplication = this.validatePostDuplication.bind(this);
    this.onAdd = this.onAdd.bind(this);
  }

  close() {
    this.props.closeModal();
  }

  handleAdd(e) {
    if ( this.state.newRows == 1 ) {
      return alert("하나씩 추가해 주시기 바랍니다");
    }
    this.setState({
      newRows: this.state.newRows+1
    });
  }

  handleCancelAdd(e) {
    this.setState({
      newRows: this.state.newRows - 1
    })
  }

  validatePostDuplication(post) {
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
      url: null
    }
    for ( var i = 0; i < count; i++ ) {
      newRows.push(
        <PostInfoRow 
          key={utils.getRandomInteger(1, 5000)}
          postInfo={emptyPostInfo}
          onAdd={this.onAdd}
          onEdit={this.props.updatePostInfo}
          onRemove={this.props.removePostInfo}
          onCancelAdd={this.handleCancelAdd} 
          validatePostDuplication={this.validatePostDuplication}></PostInfoRow>
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
                  key={utils.getRandomInteger(1, 5000)}
                  postInfo={postInfo} 
                  onEdit={this.props.updatePostInfo} 
                  onRemove={this.props.removePostInfo}
                  validatePostDuplication={this.validatePostDuplication} ></PostInfoRow> ) }
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