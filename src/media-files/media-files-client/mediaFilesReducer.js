import { MAKE_STACK_FILE_DOWNLOADED } from './actions/types';

export default function(state, action) {
  switch( action.type ) {
    case MAKE_STACK_FILE_DOWNLOADED:
      return state.map((files, i) => {
        if ( (i+1) == action.payload.team && Array.isArray(files) ) {
          return files.map((file) => {
            if ( action.payload.filename != file.filename ) {
              return file;
            }
            let newFile = {
              filename : file.filename,
              downloaded: true
            }

            return newFile;
          });
        }
        return files;
      });

    default: 
      return state;
  }
}