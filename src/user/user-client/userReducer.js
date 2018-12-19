import { UPDATE_POINTS } from './actions/types';

var initialState = {};

export default (state = initialState, action) => {
  switch(action.type) {
    case UPDATE_POINTS :
      return Object.assign({}, state, {
        points: action.payload
      });

    default: return state;
  }
};