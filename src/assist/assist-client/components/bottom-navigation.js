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
        <NavLink to="/assist/page/map">
          <div className="icon"><FontAwesomeIcon icon={faMap} /></div>
          <div className="text">지도</div>
          <div className={rippleCN}></div>
        </NavLink>
        <NavLink to="/assist/page/point">
          <div className="icon"><FontAwesomeIcon icon={faChartBar} /></div>
          <div className="text">포인트</div>
          <div className={rippleCN}></div>
        </NavLink>
        <NavLink to="/assist/page/result">
          <div className="icon"><FontAwesomeIcon icon={faChessBoard} /></div>
          <div className="text">진행상황</div>
          <div className={rippleCN}></div>
        </NavLink>
      </div>
    );
  }
}

export default BottomNavigation;