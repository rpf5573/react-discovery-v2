import { UPDATE_POINTS } from './actions/types';

export default (state = {}, action) => {
  switch(action.type) {
    case UPDATE_POINTS:
      return Object.assign({}, state, {
        useablePoints: action.payload
      });

    default: return state;
  }
};