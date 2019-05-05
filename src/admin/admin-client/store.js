import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducers from './reducers';
import { composeWithDevTools } from 'redux-devtools-extension';

let middleWare = [thunk];

export default function configureStore(initialSettings) {

  if ( initialSettings.postInfos && initialSettings.postInfos.length > 0 ) {
    for ( var i = 0; i < initialSettings.postInfos.length; i++ ) {
      let decodedURL = decodeURI(initialSettings.postInfos[i].url);
      initialSettings.postInfos[i].url = decodedURL;
    }
  }

  var initialState = {
    teamSettings: {
      teamPasswords: initialSettings.teamPasswords,
      teamCount: initialSettings.teamCount
    },
    modalControl: {
      activeModalClassName: "",
      activeMenuBtnClassName: ""
    },
    timer: {
      laptime: parseInt(initialSettings.laptime),
      teamTimers: initialSettings.teamTimers,
      eniacState: parseInt(initialSettings.eniacState),
      tempBoxState: parseInt(initialSettings.tempBoxState)
    },
    uploads: {
      companyImage: initialSettings.companyImage,
      map: initialSettings.map
    },
    puzzleSettings: {
      puzzleBoxCount: parseInt(initialSettings.puzzleBoxCount),
      eniacWords: initialSettings.originalEniacWords,
      randomEniacWords: JSON.parse(initialSettings.randomEniacWords),
      lastBoxUrl: decodeURI(initialSettings.lastBoxUrl),
      lastBoxState: parseInt(initialSettings.lastBoxState)
    },
    adminPasswords: JSON.parse(initialSettings.adminPasswords),
    mappingPoints: JSON.parse(initialSettings.mappingPoints),
    postInfos: initialSettings.postInfos
  };

  const store = createStore(
    reducers,
    initialState,
    composeWithDevTools(
      applyMiddleware(...middleWare)
    ),
  );
  return store
}