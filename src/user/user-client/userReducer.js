import { UPDATE_POINTS, UPDATE_PUZZLE_COLON_INFO, UPDATE_PREVIEW_IMAGE } from './actions/types';

var initialState = {
  points: [],
  puzzleColonInfo: [],
  previewImgSrc: null
};

export default (state = initialState, action) => {
  switch(action.type) {

    case UPDATE_POINTS:
      return Object.assign({}, state, {
        points: action.payload
      });
    
    case UPDATE_PUZZLE_COLON_INFO:
      return Object.assign({}, state, {
        puzzleColonInfo: action.payload
      });

    case UPDATE_PREVIEW_IMAGE:
      return Object.assign({}, state, {
        previewImgSrc: action.payload
      });

    default: return state;
  }
};