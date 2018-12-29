import { createStore, applyMiddleware } from 'redux';
import reducer from './userReducer';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

let middleWare = [thunk];

export default function configureStore(initialSettings = {}) {
  
  initialSettings.mapping_points = JSON.parse(initialSettings.mapping_points); // 실패할리 없음
  initialSettings.random_eniac_words = JSON.parse(initialSettings.random_eniac_words); // 실패할일 없음 어차피 null도 받으니까

  var initialState = initialSettings;
  initialState.fileInfo = {
    src: null,
    type: null
  }
  // initialState.progressVal = 0;

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