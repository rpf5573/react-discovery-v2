import { UPDATE_LAPTIME, UPDATE_TEAM_TIMER_STATE, UPDATE_ENIAC_STATE, UPDATE_TEMP_BOX_STATE } from '../actions/types';


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

    case UPDATE_ENIAC_STATE:
      return Object.assign({}, state, {
        eniacState: action.payload
      });

    case UPDATE_TEMP_BOX_STATE:
      return Object.assign({}, state, {
        tempBoxState: action.payload
      })
      
    default: 
      return state;
  }
}