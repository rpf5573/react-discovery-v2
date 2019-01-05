import { createStore, applyMiddleware } from 'redux';
import reducer from './assistReducer';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

let middleWare = [thunk];

export default function configureStore(initialSettings = {}) {

  console.log( 'initialSettings : ', initialSettings );

  var initialState = {
    map: initialSettings.map,
    teamCount : initialSettings.teamCount,
    useablePoints : initialSettings.useablePoints,
    postInfos : initialSettings.postInfos,
    puzzleColonInfo : initialSettings.puzzleColonInfo,
    randomEniacWords : JSON.parse(initialSettings.random_eniac_words), // 실패할일 없음 어차피 null도 받으니까
    lastBoxGoogleDriveUrl : decodeURI(initialSettings.lastbox_google_drive_url),
    lastBoxState : parseInt(initialSettings.lastbox_state),
    puzzleBoxCount: parseInt(initialSettings.puzzlebox_count),
  };

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