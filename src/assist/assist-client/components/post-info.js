import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons'

import NotReady from './not-ready';

class PostInfo extends Component {
  constructor(props) {
    super(props);

    this.renderPostInfoListItems = this.renderPostInfoListItems.bind(this);
  }

  renderPostInfoListItems() {
    var listItems = [];
    for ( var i = 0; i < this.props.postInfos.length; i++ ) {
      const row = this.props.postInfos[i];
      listItems.push(
        <a key={`${i}-post-info`} className="post-info-list-item" href={row.url} target="_blank" rel="noopener noreferrer">
          <span> { `${row.post}포스트 - ${row.mission}` } </span>
          <FontAwesomeIcon icon={faPlayCircle} className="icon">
          </FontAwesomeIcon>
        </a>);
    }
    return listItems;
  }
 
  render() {
    if ( ! this.props.postInfos.length ) {
      return (<NotReady></NotReady>);
    }

    return (
      <div className="post-info-page full-container">
        <h2 className="title">포스트 동영상 정보</h2>
        <div className="post-info-list">
          { this.renderPostInfoListItems() }
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    ourTeam: state.loginData ? state.loginData.team : false,
    postInfos: state.postInfos ? state.postInfos : []
  };
}

export default connect(mapStateToProps, null)(PostInfo);