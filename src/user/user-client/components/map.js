import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

class Map extends Component {
  constructor(props) {
    super(props);
  }
  render() {
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