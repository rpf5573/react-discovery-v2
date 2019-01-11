import { UPDATE_POST_INFO, ADD_POST_INFO, REMOVE_POST_INFO } from '../actions/types';

export default function(state = [], action) {
  switch( action.type ) {
    case UPDATE_POST_INFO :
      return state.map((postInfo, i) => {
        if ( action.payload.originalPost != postInfo.post ) {
          return postInfo;
        }
        return action.payload;
      });

    case ADD_POST_INFO:
      return [
        ...state,
        action.payload
      ];
    case REMOVE_POST_INFO:
      var index = 0;
      for ( var i = 0; i < state.length; i++ ) {
        if ( state[i].post == action.payload ) {
          index = i;
        }
      }
      return [...state.slice(0, index), ...state.slice(index + 1)];

    default: 
      return state;
  }
}