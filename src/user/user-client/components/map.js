import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import NotReady from './not-ready';

class Map extends Component {
  constructor(props) {
    super(props);
  }
  render() {

    console.log( 'this.props.map : ', this.props.map );

    if ( !this.props.map) {
      return ( <NotReady></NotReady> );
    }

    return (
      <div className="map-page full-container">
        <div className="wrapper">
          <img src={`/admin/uploads/${window.__dcv__}/${this.props.map}`}></img>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    map: state.map
  };
}

export default connect(mapStateToProps, null)(Map);