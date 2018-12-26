// react & redux
import React, { Component, Fragment } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

// components
import BottomNavigation from './bottom-navigation';
import Map from './map';
import Point from './point';
import Puzzle from './puzzle';
import Upload from './upload';
import PostInfo from './post-info';

// css
import '../scss/style.scss';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="container">
          <div className="l-top">
            <Switch>
              <Route exact path={"/user"} component={Map} />
              <Route path={"/user/page/map"} component={Map} />
              <Route path="/user/page/point" render={(props) => <Point {...props} chartData={[]}></Point>} />
              <Route path="/user/page/puzzle" component={Puzzle} />
              <Route path="/user/page/upload"  component={Upload} />
              <Route path="/user/page/post-info" component={PostInfo} />
            </Switch>
          </div>
          <div className="l-bottom">
            <BottomNavigation></BottomNavigation>
          </div>
        </div>
      </BrowserRouter>
    );
  }

}

export default App;