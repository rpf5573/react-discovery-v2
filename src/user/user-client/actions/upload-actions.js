import { UPLOAD_FILE, UPDATE_PREVIEW_IMAGE } from './types';

export const uploadFile = (test) => dispatch => {
  dispatch({
    type: UPLOAD_FILE,
    payload: test
  });
}

export const updatePreviewImage = (previewImgSrc) => dispatch => {
  dispatch({
    type: UPDATE_PREVIEW_IMAGE,
    payload: previewImgSrc
  });
}