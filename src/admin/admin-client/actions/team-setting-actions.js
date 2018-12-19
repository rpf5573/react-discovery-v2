import { UPDATE_TEAM_PASSWORDS, UPDATE_TEAM_COUNT } from '../actions/types';

export const updateTeamCount = (teamCount) => dispatch => {
  dispatch({
    type: UPDATE_TEAM_COUNT,
    payload: teamCount
  });
};

export const updateTeamPasswords = (passwords) => dispatch => {
  dispatch({
    type: UPDATE_TEAM_PASSWORDS,
    payload: passwords
  });
}