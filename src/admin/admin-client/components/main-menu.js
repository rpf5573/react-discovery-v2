import React, { Component } from 'react';
import { connect } from 'react-redux';
import MainMenuItem from './main-menu-item';

export default class MainMenu extends Component {

  constructor(props) {
    super(props);
  }

  createMenu() {
    let menuList = [
      {label: "팀설정", className: "team-setting"},
      {label: "타이머", className: "timer"},
      {label: "이미지설정", className: "uploads"},
      {label: "박스설정", className: "puzzle-settings"},
      {label: "박스점유현황", className: "puzzle-status"},
      {label: "본부 점수 제공", className: "point-reward"},
      {label: "최종결과", className: "result"},
      {label: "점수배정표", className: "mapping-points"},
      {label: "포스트 정보", className: "post-info"},
      {label: "관리자 비밀번호", className: "admin-passwords"},
      {label: "초기화", className: "reset"},
    ];

    var tagList = [];
    menuList.forEach((menuItem) => {
      tagList.push(
        <MainMenuItem className={menuItem.className} label={menuItem.label} key={menuItem.className}></MainMenuItem>
      );
    });
    return tagList;
  }

  render() {
    return (
      <ul className="main-menu list-unstyled">
        {this.createMenu()}
      </ul>
    );
  }
}