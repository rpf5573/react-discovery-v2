import { UPDATE_POST_INFO, ADD_POST_INFO, REMOVE_POST_INFO } from './actions/types';

export default function(state, action) {
  switch( action.type ) {
    case UPDATE_POST_INFO :
      var newPostInfos = state.postInfos.map((postInfo, i) => {
        if ( action.payload.id != postInfo.id ) {
          return postInfo;
        }
        return action.payload;
      });

      return Object.assign({}, state, {
        postInfos: newPostInfos
      });

    case ADD_POST_INFO:
      var newPostInfos = [
        ...state.postInfos,
        action.payload
      ];

      return Object.assign({}, state, {
        postInfos: newPostInfos
      });

    case REMOVE_POST_INFO:
      var index = 0;
      for ( var i = 0; i < state.postInfos.length; i++ ) {
        if ( state.postInfos[i].id == action.payload ) {
          index = i;
        }
      }

      // 사실 위에 add처럼 해도 되기는 하는데, 삭제 후 위치를 보존해주기 위해서... 이렇게 하는거다 !
      var newPostInfos = [...state.postInfos.slice(0, index), ...state.postInfos.slice(index + 1)];
      return Object.assign({}, state, {
        postInfos: newPostInfos
      });

    default: 
      return state;
  }
}