import { UPDATE_MAPPING_POINTS } from '../actions/types';

export default function(state = {}, action) {
  switch( action.type ) {
    case UPDATE_MAPPING_POINTS :
      return Object.assign({}, state, action.payload);
    default: 
      return state;
  }
}