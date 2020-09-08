import { INVALID_FILE_FORMAT, INITIALIZE_DROPSTORE } from '../constants/actionTypes';
import { DROPZONE_POSTER1, DROPZONE_POSTER2, DROPZONE_VIDEO } from '../constants/actionTypes';

// const reducer = (state = {drop_error: [false, false, false]}, action) => {
// 	switch (action.type) {
// 		case INVALID_FILE_FORMAT:
// 			//drop_error[action.dropzone] = true
// 			//return { ...state, drop_error: action.payload };
// 			const newState = { ...state };
// 			newState.drop_error[action.payload] = true;
// 			return newState
// 		default:
// 			return state;
// 	}
// };

const initialState = {
	poster1_file_error: false,
	video_file_error: false,
	poster2_file_error: false,
}

const reducer = (state = initialState, action) => {
	switch (action.type) {
		case INVALID_FILE_FORMAT:
			{
				switch(action.payload)
				{
					case DROPZONE_POSTER1: return {...state, poster1_file_error: true}
					case DROPZONE_VIDEO: return {...state, video_file_error: true}
					case DROPZONE_POSTER2: return {...state, poster2_file_error: true}
				}
			}
		case INITIALIZE_DROPSTORE:
			return {...state, 
				poster1_file_error: false,
				video_file_error: false,
				poster2_file_error: false}
		default:
			return state;
	}
};


export default reducer;
  