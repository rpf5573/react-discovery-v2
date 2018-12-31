import { UPDATE_POST_INFO, ADD_POST_INFO, REMOVE_POST_INFO } from './actions/types';

export default function(state, action) {
  console.log( 'state : ', state );
  switch( action.type ) {
    case UPDATE_POST_INFO :
      var newPostInfos = state.postInfos.map((postInfo, i) => {
        if ( action.payload.post != postInfo.post ) {
          return postInfo;
        }
        return action.payload;
      });

      return Object.assign({}, state, {
        postInfos: newPostInfos
      });

    case ADD_POST_INFO:
      console.log( 'action.payload : ', action.payload );
      console.log( 'state : ', state );
      var newPostInfos = [
        ...state.postInfos,
        action.payload
      ];

      return Object.assign({}, state, {
        postInfos: newPostInfos
      });

    case REMOVE_POST_INFO:
      var index = 0;
      for ( var i = 0; i < state.length; i++ ) {
        if ( state[i].post == action.payload ) {
          index = i;
        }
      }
      var newPostInfos = [...state.postInfos.slice(0, index), ...state.postInfos.slice(index + 1)];
      return Object.assign({}, state, {
        postInfos: newPostInfos
      });

    default: 
      return state;
  }
}