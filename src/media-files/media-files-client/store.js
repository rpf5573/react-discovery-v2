import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducers from './mediaFilesReducer';
import { composeWithDevTools } from 'redux-devtools-extension';

let middleWare = [thunk];

export default function configureStore(initialSettings) {
  var initialState = initialSettings.map((obj) => {
    return (JSON.parse(obj.stackFiles));
  });

  const store = createStore(
    reducers,
    initialState,
    composeWithDevTools(
      applyMiddleware(...middleWare)
    ),
  );
  return store
}