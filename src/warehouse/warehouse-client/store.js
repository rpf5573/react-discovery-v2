import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducers from './warehouseReducers';
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