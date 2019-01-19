import React, { Component, Fragment } from 'react';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';

class NotReady extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <SnackbarContent 
        className="not-ready"
        message={
          <span className="message">
            <WarningIcon className="icon"/>
            { this.props.message ? this.props.message : '잠시후에 새로고침 해주시기 바랍니다' }
          </span>
        }
      />
    );
  }
}

export default NotReady;