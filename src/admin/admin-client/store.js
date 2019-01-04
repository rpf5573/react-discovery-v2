import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducers from './reducers';
import { composeWithDevTools } from 'redux-devtools-extension';

let middleWare = [thunk];

export default function configureStore(initialSettings) {

  if ( initialSettings.postInfos && initialSettings.postInfos.length > 0 ) {
    for ( var i = 0; i < initialSettings.postInfos.length; i++ ) {
      let decodedURL = decodeURI(initialSettings.postInfos[i].google_drive_url);
      initialSettings.postInfos[i].google_drive_url = decodedURL;
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
      eniacState: parseInt(initialSettings.eniac_state),
    },
    uploads: {
      companyImage: initialSettings.company_image,
      map: initialSettings.map
    },
    puzzleSettings: {
      puzzleBoxCount: parseInt(initialSettings.puzzlebox_count),
      eniacWords: initialSettings.original_eniac_words,
      lastBoxGoogleDriveUrl: decodeURI(initialSettings.lastbox_google_drive_url),
      lastBoxState: parseInt(initialSettings.lastbox_state)
    },
    adminPasswords: JSON.parse(initialSettings.admin_passwords),
    mappingPoints: JSON.parse(initialSettings.mapping_points),
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