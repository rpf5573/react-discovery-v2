import React, { Component } from 'react';
import axios from 'axios';
import * as utils from '../../../utils/client';
import { Dropdown, DropdownToggle, DropdownItem, DropdownMenu, } from 'reactstrap';

const Spinner = function(props) {
  return (
    <div className="lds-spinner">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

class FileDownloadDropDown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dropdown: false,
      waiting: false,
      zipPath: false,
      activeTeam: false
    }

    this.handleRequestZipPathBtnClick = this.handleRequestZipPathBtnClick.bind(this);
  }

  async handleRequestZipPathBtnClick(e) {
    const team = parseInt(e.currentTarget.getAttribute('data-team'));
    this.setState({
      activeTeam: team,
      waiting: true
    });
    const config = {
      method: "POST",
      url: "/admin/zip-path",
      data: {
        team
      }
    }
    utils.simpleAxios(axios, config).then((response) => {
    }).catch(e => {
      this.setState({
        waiting: false,
        activeTeam: false
      });
    });
  }

  renderDropdownList() {
    var list = [];
    for ( var i = 0; i < 10; i++ ) {
      const team = i + 1;
      list.push(
        <DropdownItem 
          key={i}
          toggle={false} 
          data-team={team} 
          onClick={this.handleRequestZipPathBtnClick}>
          {team}팀
          { (this.state.activeTeam == team && this.state.waiting ) ? <Spinner></Spinner> : '' }
        </DropdownItem>
      );
    }
    return list;
  }

  render() {
    return (
      <Dropdown className="file-download-dropdown" direction="left" isOpen={this.state.dropdown} toggle={() => { this.setState({ dropdown: !this.state.dropdown }); }}>
        <DropdownToggle color="info" caret>
          미션자료 다운로드
        </DropdownToggle>
        <DropdownMenu>
          {this.renderDropdownList()}
        </DropdownMenu>
      </Dropdown>
    )
  }
}

export default FileDownloadDropDown;