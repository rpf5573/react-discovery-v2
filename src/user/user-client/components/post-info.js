import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import PlayCircleOutline from '@material-ui/icons/PlayCircleOutline';
import NotReady from './not-ready';

class PostInfo extends Component {
  constructor(props) {
    super(props);

    this.renderPostInfoListItems = this.renderPostInfoListItems.bind(this);
  }

  renderPostInfoListItems() {
    var listItems = [];
    if ( this.props.postInfos.length > 0 ) {
      for ( var i = 0; i < this.props.postInfos.length; i++ ) {
        const row = this.props.postInfos[i];
        listItems.push(
          <ListItem key={`${i}-post-info`} button component="a" className="post-info-list-item" href={row.url} target="_blank" rel="noopener noreferrer">
            <ListItemText primary={`${row.post}포스트 - ${row.mission}`} />
            <IconButton aria-label="PlayCircleOutline">
              <PlayCircleOutline />
            </IconButton>
          </ListItem> );
      }
    }

    return listItems;
  }
 
  render() {
    if ( !this.props.postInfos.length) {
      return ( <NotReady></NotReady> );
    }

    return (
      <div className="post-info-page full-container">
        <h2 className="title">포스트 동영상 정보</h2>
        <List component="nav" className="post-info-list">
          { this.renderPostInfoListItems() }
        </List>
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