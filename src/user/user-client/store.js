import { createStore, applyMiddleware } from 'redux';
import reducer from './userReducer';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

let middleWare = [thunk];

export default function configureStore(initialSettings = {}) {
  
  initialSettings.mappingPoints = JSON.parse(initialSettings.mappingPoints); // 실패할리 없음
  initialSettings.randomEniacWords = JSON.parse(initialSettings.randomEniacWords); // 실패할일 없음 어차피 null도 받으니까
  initialSettings.lastBoxState = parseInt(initialSettings.lastBoxState);
  initialSettings.tempBoxState = parseInt(initialSettings.tempBoxState);
  initialSettings.laptime = parseInt(initialSettings.laptime);
  initialSettings.puzzleBoxCount = parseInt(initialSettings.puzzleBoxCount);

  var initialState = initialSettings;
  initialState.fileInfo = {
    src: null,
    type: null,
    mediaType: null
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