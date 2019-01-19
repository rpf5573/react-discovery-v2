import { UPDATE_PUZZLE_BOX_COUNT, UPDATE_ENIAC_WORDS, UPDATE_RANDOM_ENIAC_WORDS, UPDATE_LASTBOX_URL, UPDATE_LASTBOX_STATE } from '../actions/types';

export default function(state = {
  puzzleBoxCount: 20
}, action) {
  switch( action.type ) {
    case UPDATE_PUZZLE_BOX_COUNT :
      return Object.assign({}, state, {
        puzzleBoxCount: action.payload
      });
    
    case UPDATE_ENIAC_WORDS :
      return Object.assign({}, state, {
        eniacWords: action.payload
      });

    case UPDATE_RANDOM_ENIAC_WORDS :
      return Object.assign({}, state, {
        randomEniacWords: action.payload
      });

    case UPDATE_LASTBOX_URL :
      return Object.assign({}, state, {
        lastBoxUrl: action.payload
      });
    
    case UPDATE_LASTBOX_STATE:
      return Object.assign({}, state, {
        lastBoxState: action.payload
      });
    
    default:
      return state;
  }
}