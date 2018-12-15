import { UPDATE_ADMIN_PASSWORDS } from '../actions/types';

export default function(state = {
  super: 0,
  secondary: 0
}, action) {
  console.log( 'admin-password-reducer', ' is called' );
  console.log( 'state : ', state );
  switch( action.type ) {
    case UPDATE_ADMIN_PASSWORDS :
      return Object.assign({}, state, action.payload);
    default: 
      return state;
  }
}