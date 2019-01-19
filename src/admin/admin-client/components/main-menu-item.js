import React, { Component } from 'react';
import { connect } from 'react-redux';
import cn from 'classnames';
import { openModal, toggleMenuBtns } from '../actions/modal-control-actions';

class MainMenuItem extends Component {
  constructor(props) {
    super(props);
    this.onClickBtn = this.onClickBtn.bind(this);
  }

  onClickBtn(e) {
    this.props.toggleMenuBtns(this.props.className);
    this.props.openModal('modal--' + this.props.className);
  }

  render() {
    let className = cn('menu-item', ('menu-item--'+this.props.className), { 'is-active' : ( this.props.activeMenuBtnClassName == this.props.className ? true : false ) });
    return (
      <li className={className} key={this.props.className}>
        <button onClick={this.onClickBtn}>
          {this.props.label}
          <div className="ripple js-ripple">
            <span className="ripple__circle"></span>
          </div>
        </button>
      </li>
    );
  }
}

function mapStateToProps(state) {
  return { activeMenuBtnClassName : state.modalControl.activeMenuBtnClassName };
}

export default connect(mapStateToProps, { openModal, toggleMenuBtns })(MainMenuItem);