import { UPDATE_TEAM_TIMER_STATE, UPDATE_LAPTIME } from './types';

export const updateLapTime = (laptime) => dispatch => {
  dispatch({
    type: UPDATE_LAPTIME,
    payload: laptime
  });
}

export const updateTeamTimerState = (teamTimers) => dispatch => {
  dispatch({
    type: UPDATE_TEAM_TIMER_STATE,
    payload: teamTimers
  });
}