import { combineReducers } from 'redux';
import teamSettingReducer from './team-setting-reducer';
import modalControlReducer from './modal-control-reducer';
import timerReducer from './timer-reducer';
import uploadReducer from './upload-reducer';
import puzzleSettingReducer from './puzzle-setting-reducer';
import adminPasswordReducer from './admin-password-reducer';
import mappingPointsReducer from './mapping-points-reducer';
import postInfoReducer from './post-info-reducer';

export default combineReducers({
  teamSettings: teamSettingReducer,
  modalControl: modalControlReducer,
  timer: timerReducer,
  uploads: uploadReducer,
  puzzleSettings: puzzleSettingReducer,
  adminPasswords: adminPasswordReducer,
  mappingPoints: mappingPointsReducer,
  postInfos: postInfoReducer
});