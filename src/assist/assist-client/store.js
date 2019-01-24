import { createStore, applyMiddleware } from 'redux';
import reducer from './assistReducer';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

let middleWare = [thunk];

export default function configureStore(initialSettings = {}) {

  var initialState = {
    map: initialSettings.map,
    teamCount : initialSettings.teamCount,
    useablePoints : initialSettings.useablePoints,
    postInfos : initialSettings.postInfos,
    puzzleColonInfos : initialSettings.puzzleColonInfos,
    randomEniacWords : JSON.parse(initialSettings.randomEniacWords), // 실패할일 없음 어차피 null도 받으니까
    lastBoxUrl : decodeURI(initialSettings.lastBoxUrl),
    lastBoxState : parseInt(initialSettings.lastBoxState),
    puzzleBoxCount: parseInt(initialSettings.puzzleBoxCount),
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