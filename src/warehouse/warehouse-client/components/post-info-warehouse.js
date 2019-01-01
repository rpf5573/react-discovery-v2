import * as utils from '../../../utils/client';
import React from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col, Table } from 'reactstrap';
import { updatePostInfo, addPostInfo, removePostInfo } from '../actions';
import cn from 'classnames';
import PostInfoRow from './post-info-row';

class PostInfoWarehouse extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      emptyRow: false,
      newRows: 0
    }
    this.handleAdd = this.handleAdd.bind(this);
    this.handleCancelAdd = this.handleCancelAdd.bind(this);
    this.renderNewRows = this.renderNewRows.bind(this);
    this.validateAdd = this.validateAdd.bind(this);
    this.onAdd = this.onAdd.bind(this);
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
          key={utils.getRandomInteger(1, 5000)}
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
      <div className="post-info-warehouse">
        <h2 className="title">포스트 정보 창고</h2>
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
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  console.log( 'state in mapStateToProps : ', state );
  return {
    postInfos: state.postInfos
  };
}

export default connect(mapStateToProps, { updatePostInfo, addPostInfo, removePostInfo })(PostInfoWarehouse);