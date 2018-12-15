import { UPDATE_INITIAL_STATE } from '../actions/types';

export const updateInitialState = (json) => dispatch => {
  dispatch({
    type: UPDATE_INITIAL_STATE,
    payload: json
  });
}