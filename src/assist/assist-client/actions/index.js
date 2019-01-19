import { UPDATE_POINTS, UPDATE_PUZZLE_COLON_INFOS } from './types';

export const updatePoints = (points) => dispatch => {
  dispatch({
    type: UPDATE_POINTS,
    payload: points
  });
}

export const updatePuzzleColonInfos = (puzzleColonInfos) => dispatch => {
  dispatch({
    type: UPDATE_PUZZLE_COLON_INFOS,
    payload: puzzleColonInfos
  });
}