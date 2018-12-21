import { createStore, applyMiddleware } from 'redux';
import reducer from './userReducer';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

let middleWare = [thunk];

export default function configureStore(initialSettings = {}) {
  
  initialSettings.mapping_points = JSON.parse(initialSettings.mapping_points);
  initialSettings.random_eniac_words = JSON.parse(initialSettings.random_eniac_words);

  var initialState = initialSettings;

  console.log( 'initialState : ', initialState );
  const store = createStore(
    reducer,
    initialState,
    composeWithDevTools(
      applyMiddleware(...middleWare)
    ),
  );

  return store
}