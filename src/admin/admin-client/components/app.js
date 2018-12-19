// utils
import axios from 'axios';
import _ from 'lodash';

// react & redux
import React, { Component } from 'react';
import { Provider } from 'react-redux';

// components
import MainMenu from './main-menu';
import MainBoard from './main-board';
import Modals from './modals';

// css
import 'bootstrap/dist/css/bootstrap.css';
import '../scss/style.scss';

class App extends Component {

  render() {
    return (
      <div className="page">
        <div className="sidebar">
          <MainMenu></MainMenu>
        </div>
        <div className="main">
          <MainBoard></MainBoard>
        </div>
        <Modals></Modals>
      </div>
    );
  }

}

export default App;