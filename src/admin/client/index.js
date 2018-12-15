// defaults
import React from 'react';
import App from './components/app';
import configureStore from './store';
import { hydrate } from 'react-dom';

let initialSettings = window.__PRELOADED_STATE__;

if ( initialSettings ) {

  let store = configureStore(initialSettings);

  hydrate(
    <Provider store={store}>
      <App></App>
    </Provider>,
    document.getElementById('app'),
  );

} else {
  console.log( 'ERROR !!! No Initial State !' );
}