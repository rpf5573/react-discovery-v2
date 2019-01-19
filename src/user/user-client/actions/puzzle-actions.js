import { UPDATE_PUZZLE_COLON_INFOS } from './types';

export const updatePuzzleColonInfos = (puzzleColonInfos) => dispatch => {
  dispatch({
    type: UPDATE_PUZZLE_COLON_INFOS,
    payload: puzzleColonInfos
  });
}