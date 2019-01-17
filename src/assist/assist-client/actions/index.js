import { UPDATE_POINTS, UPDATE_PUZZLE_COLON_INFO } from './types';

export const updatePoints = (points) => dispatch => {
  dispatch({
    type: UPDATE_POINTS,
    payload: points
  });
}

export const updatePuzzleColonInfo = (puzzleColonInfos) => dispatch => {
  dispatch({
    type: UPDATE_PUZZLE_COLON_INFO,
    payload: puzzleColonInfos
  });
}