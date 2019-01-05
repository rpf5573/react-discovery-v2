import React, { Component, Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

class NotReady extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div className="not-ready">
        <div className="content">
          <span className="message">
            <FontAwesomeIcon icon={faExclamationTriangle} className="icon"></FontAwesomeIcon>
            { this.props.message ? this.props.message : '잠시후에 새로고침 해주시기 바랍니다' }
          </span>
        </div>
      </div>
    );
  }
}

export default NotReady;