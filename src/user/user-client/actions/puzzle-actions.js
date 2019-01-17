import { UPDATE_PUZZLE_COLON_INFO } from './types';

export const updatePuzzleColonInfo = (puzzleColonInfos) => dispatch => {
  dispatch({
    type: UPDATE_PUZZLE_COLON_INFO,
    payload: puzzleColonInfos
  });
}