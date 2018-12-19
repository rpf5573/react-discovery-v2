import { createStore, applyMiddleware } from 'redux';
import reducer from './userReducer';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

let middleWare = [thunk];

export default function configureStore(initialSettings = {}) {
  var initialState = initialSettings;
  const store = createStore(
    reducer,
    initialState,
    composeWithDevTools(
      applyMiddleware(...middleWare)
    ),
  );

  return store
}