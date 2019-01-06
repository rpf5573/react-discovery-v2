// react & redux
import React, { Component } from 'react';
import PostInfoWarehouse from './post-info-warehouse';

// components

// css
import 'bootstrap/dist/css/bootstrap.css';
import '../scss/style.scss';

class App extends Component {
  render() {
    return (
      <div className="page">
        <PostInfoWarehouse></PostInfoWarehouse>
      </div>
    );
  }
}

export default App;