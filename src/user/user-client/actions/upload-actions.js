import { UPLOAD_FILE, UPDATE_FILE_INFO, UPDATE_PROGRESS_VAL } from './types';

export const uploadFile = (test) => dispatch => {
  dispatch({
    type: UPLOAD_FILE,
    payload: test
  });
}

export const updateFileInfo = (fileInfo) => dispatch => {
  dispatch({
    type: UPDATE_FILE_INFO,
    payload: fileInfo
  });
}

export const updateProgressVal = (val) => dispatch => {
  dispatch({
    type: UPDATE_PROGRESS_VAL,
    payload: val
  });
}