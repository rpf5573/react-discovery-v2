import { OPEN_MODAL, TOGGLE_MENU_BTNS, CLOSE_MODAL } from '../actions/types';

export default function(state={
  activeModalClassName: '',
  activeMenuBtnClassName: '',
}, action) {
  var modalControl = {};
  switch( action.type ) {
    case OPEN_MODAL :
      return Object.assign({}, state, {
        activeModalClassName: action.payload
      });
    case TOGGLE_MENU_BTNS :
      return Object.assign({}, state, {
        activeMenuBtnClassName: action.payload
      });
    case CLOSE_MODAL:
      return Object.assign({}, state, {
        activeModalClassName: null,
        activeMenuBtnClassName: null
      });
    default:
      return state;
  }
}