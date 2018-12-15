import { OPEN_MODAL, TOGGLE_MENU_BTNS, CLOSE_MODAL } from './types';

export const openModal = (activeModalClassName) => dispatch => {
  dispatch({
    type: OPEN_MODAL,
    payload: activeModalClassName
  });
};

export const toggleMenuBtns = (activeMenuBtnClassName) => dispatch => {
  dispatch({
    type: TOGGLE_MENU_BTNS,
    payload: activeMenuBtnClassName
  });
}

export const closeModal = () => dispatch => {
  dispatch({
    type: CLOSE_MODAL,
    payload: null
  });
}