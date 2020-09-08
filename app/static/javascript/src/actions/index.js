import { INVALID_FILE_FORMAT, INITIALIZE_DROPSTORE } from '../constants/actionTypes';

export const invalid_file_format = (dropzone) => ({
	type: INVALID_FILE_FORMAT,
	payload: dropzone
});

export const initalize_dropstore = () => ({
	type: INITIALIZE_DROPSTORE
});