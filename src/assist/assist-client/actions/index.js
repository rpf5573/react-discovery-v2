import { UPDATE_POINTS } from './types';

export const updatePoints = (points) => dispatch => {
  dispatch({
    type: UPDATE_POINTS,
    payload: points
  });
}