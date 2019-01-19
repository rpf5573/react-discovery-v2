import { UPDATE_POINTS, UPDATE_PUZZLE_COLON_INFOS, UPDATE_FILE_INFO, UPDATE_PROGRESS_VAL } from './actions/types';

export default (state = {}, action) => {
  switch(action.type) {
    case UPDATE_POINTS:
      return Object.assign({}, state, {
        points: action.payload
      });

    case UPDATE_PUZZLE_COLON_INFOS:
      return Object.assign({}, state, {
        puzzleColonInfos: action.payload
      });

    case UPDATE_FILE_INFO:
      return Object.assign({}, state, {
        fileInfo: action.payload
      });

    case UPDATE_PROGRESS_VAL:
      return Object.assign({}, state, {
        progressVal: action.payload
      });

    default: return state;
  }
};