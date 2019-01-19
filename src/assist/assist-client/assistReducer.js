import { UPDATE_POINTS, UPDATE_PUZZLE_COLON_INFOS } from './actions/types';

export default (state = {}, action) => {
  switch(action.type) {
    case UPDATE_POINTS:
      return Object.assign({}, state, {
        useablePoints: action.payload
      });

    case UPDATE_PUZZLE_COLON_INFOS:
      return Object.assign({}, state, {
        puzzleColonInfos: action.payload
      });

    default: return state;
  }
};