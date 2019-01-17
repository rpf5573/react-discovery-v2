import { UPDATE_MAPPING_POINTS } from '../actions/types';

export const updateMappingPoints = (mappingPoint) => dispatch => {
  dispatch({
    type: UPDATE_MAPPING_POINTS,
    payload: mappingPoint // { timerPlus : 300 }
  });
}