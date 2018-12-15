import { UPLOAD_IMAGE_FILE } from './types';

export const uploadImageFile = (fileInfo) => dispatch => {
  dispatch({
    type: UPLOAD_IMAGE_FILE,
    payload: fileInfo
  });
}