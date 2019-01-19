import { MAKE_STACK_FILE_DOWNLOADED } from '../actions/types';

export const makeStackFileDownloaded = (team, filename) => dispatch => {
  dispatch({
    type: MAKE_STACK_FILE_DOWNLOADED,
    payload: { team, filename }
  });
}