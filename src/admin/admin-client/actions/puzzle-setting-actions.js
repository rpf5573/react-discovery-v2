import { UPDATE_PUZZLE_BOX_COUNT, UPDATE_ENIAC_WORDS, UPDATE_RANDOM_ENIAC_WORDS, UPDATE_LASTBOX_GOOGLEDRIVE_URL, UPDATE_LASTBOX_STATE } from '../actions/types';

export const updatePuzzleBoxCount = (puzzleBoxCount) => dispatch => {
  dispatch({
    type: UPDATE_PUZZLE_BOX_COUNT,
    payload: puzzleBoxCount
  });
}

export const updateEniacWords = (eniacWords) => dispatch => {
  dispatch({
    type: UPDATE_ENIAC_WORDS,
    payload: eniacWords
  });
}

export const updateRandomEniacWords = (randomEniacWords) => dispatch => {
  dispatch({
    type: UPDATE_RANDOM_ENIAC_WORDS,
    payload: randomEniacWords
  });
}

export const updateLastBoxGoogleDriveUrl = (url) => dispatch => {
  dispatch({
    type: UPDATE_LASTBOX_GOOGLEDRIVE_URL,
    payload: url
  });
}

export const updateLastBoxState = (state) => dispatch => {
  dispatch({
    type: UPDATE_LASTBOX_STATE,
    payload: state
  });
}