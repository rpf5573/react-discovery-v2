import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import cn from 'classnames';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMap, faChartBar, faChessBoard, faImages, faInfo } from '@fortawesome/free-solid-svg-icons'

library.add([faMap, faChartBar, faChessBoard, faImages, faInfo]);

class BottomNavigation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activePage : 'map'
    }
  }
  render() {
    let rippleCN = cn({
      ripple: true,
      ripple__circle: true
    });

    return (
      <div className="bottom-navigation">
        <NavLink to="/user/page/map">
          <div className="icon"><FontAwesomeIcon icon={faMap} /></div>
          <div className="text">지도</div>
          <div className={rippleCN}></div>
        </NavLink>
        <NavLink to="/user/page/point">
          <div className="icon"><FontAwesomeIcon icon={faChartBar} /></div>
          <div className="text">포인트</div>
          <div className={rippleCN}></div>
        </NavLink>
        <NavLink to="/user/page/puzzle">
          <div className="icon"><FontAwesomeIcon icon={faChessBoard} /></div>
          <div className="text">퍼즐</div>
          <div className={rippleCN}></div>
        </NavLink>
        <NavLink to="/user/page/upload">
          <div className="icon"><FontAwesomeIcon icon={faImages} /></div>
          <div className="text">업로드</div>
          <div className={rippleCN}></div>
        </NavLink>
        <NavLink to="/user/page/post-info">
          <div className="icon"><FontAwesomeIcon icon={faInfo} /></div>
          <div className="text">포스트</div>
          <div className={rippleCN}></div>
        </NavLink>
      </div>
    );
  }
}

export default BottomNavigation;