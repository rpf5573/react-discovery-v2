import { createStore, applyMiddleware } from 'redux';
import reducers from './reducers';
import { composeWithDevTools } from 'redux-devtools-extension';

let middleWare = [];

export default function configureStore(initialSettings = {}) {
  var initialState = initialSettings;
  const store = createStore(
    reducers,
    initialState,
    composeWithDevTools(
      applyMiddleware(...middleWare)
    ),
  );

  return store
}