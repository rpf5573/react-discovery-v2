import { UPDATE_ADMIN_PASSWORDS } from '../actions/types';

export default function(state = {
  admin: 0,
  assist: 0
}, action) {
  switch( action.type ) {
    case UPDATE_ADMIN_PASSWORDS :
      return Object.assign({}, state, action.payload);
    default: 
      return state;
  }
}