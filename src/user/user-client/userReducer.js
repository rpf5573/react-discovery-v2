import { UPDATE_POINTS, UPDATE_PUZZLE_COLON_INFO } from './actions/types';

var initialState = {
  points: [],
  puzzleColonInfo: []
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

    default: return state;
  }
};