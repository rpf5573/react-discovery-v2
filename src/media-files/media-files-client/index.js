// defaults
import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/app';
import configureStore from './store';
import { Provider } from 'react-redux';

let initialSettings = window.__PRELOADED_STATE__;

if ( initialSettings ) {
  let store = configureStore(initialSettings);
  ReactDOM.render(
    <Provider store={store}>
      <App></App>
    </Provider>,
    document.getElementById('app'),
  );
} else {
  console.log( 'ERROR !!! No Initial State !' );
}