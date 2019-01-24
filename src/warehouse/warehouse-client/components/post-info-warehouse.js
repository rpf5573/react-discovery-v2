import * as utils from '../../../utils/client';
import React from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col, Table } from 'reactstrap';
import { updatePostInfo, addPostInfo, removePostInfo } from '../actions';
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
    });
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
          onCancelAdd={this.handleCancelAdd}></PostInfoRow>
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
              <td style={{'width': '15%'}}>
                미션
              </td>
              <td style={{'width': '65%'}}>
                구글 드라이브 주소
              </td>
              <td style={{'width': '20%'}}></td>
            </tr>
          </thead>
          <tbody>
            { this.props.postInfos.map((postInfo, i) =>
              <PostInfoRow
                key={utils.getRandomInteger(1, 5000)}
                postInfo={postInfo} 
                onEdit={this.props.updatePostInfo} 
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
  return {
    postInfos: state.postInfos
  };
}

export default connect(mapStateToProps, { updatePostInfo, addPostInfo, removePostInfo })(PostInfoWarehouse);