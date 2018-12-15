import { UPDATE_ADMIN_PASSWORDS } from './types';

export const updateAdminPasswords = (passwords) => dispatch => {
  dispatch({
    type: UPDATE_ADMIN_PASSWORDS,
    payload: passwords
  });
};