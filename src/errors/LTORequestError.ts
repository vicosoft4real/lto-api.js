import LTOError from "./LTOError";

const FAILED_TO_FETCH = "Failed to fetch";

function normalizeErrorData(data) {
	return !data.error && data.message && data.message.indexOf(FAILED_TO_FETCH) !== -1
		? { error: -1, message: "failed to fetch"}
		: data;
}

export default class LTORequestError extends LTOError {
	constructor(url, data) {
		super(`Server request to '${url}' has failed`, normalizeErrorData(data));
		this.name = "LTORequestError";
	}
}
