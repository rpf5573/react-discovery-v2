import { UPDATE_POINTS, UPDATE_PUZZLE_COLON_INFO } from './actions/types';

export default (state = {}, action) => {
  switch(action.type) {
    case UPDATE_POINTS:
      return Object.assign({}, state, {
        useablePoints: action.payload
      });

    case UPDATE_PUZZLE_COLON_INFO:
      return Object.assign({}, state, {
        puzzleColonInfo: action.payload
      });

    default: return state;
  }
};