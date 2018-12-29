// react & redux
import React, { Component, Fragment } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

// components
import BottomNavigation from './bottom-navigation';
import Map from './map';
import Point from './point';
import Result from './result';

// css
import '../scss/style.scss';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <div className="container">
          <div className="l-top">
            <Switch>
              <Route exact path={"/assist"} component={Map} />
              <Route path={"/assist/page/map"} component={Map} />
              <Route path="/assist/page/point" render={(props) => <Point {...props} chartData={[]}></Point>} />
              <Route path="/assist/page/result" component={Result} />
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