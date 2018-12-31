import { UPDATE_POST_INFO, ADD_POST_INFO, REMOVE_POST_INFO } from './types';

export const updatePostInfo = (postInfo) => dispatch => {
  dispatch({
    type: UPDATE_POST_INFO,
    payload: postInfo
  });
}

export const addPostInfo = (postInfo) => dispatch => {
  dispatch({
    type: ADD_POST_INFO,
    payload: postInfo
  });
}

export const removePostInfo = (postInfo) => dispatch => {
  dispatch({
    type: REMOVE_POST_INFO,
    payload: postInfo
  });
};