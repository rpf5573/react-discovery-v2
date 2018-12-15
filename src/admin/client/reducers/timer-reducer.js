import { UPDATE_LAPTIME, UPDATE_TEAM_TIMER_STATE } from '../actions/types';


export default function(state = {
  laptime: 0
}, action) {
  switch( action.type ) {
    case UPDATE_LAPTIME :
      return Object.assign({}, state, {
        laptime: action.payload
      });
    case UPDATE_TEAM_TIMER_STATE :
      return Object.assign({}, state, {
        teamTimers: action.payload
      });
    default: 
      return state;
  }
}