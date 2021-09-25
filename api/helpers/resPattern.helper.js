let successPattern = (code, data, status) => {
	return {
		'code': code,
		'data': data,
		'status': status
	};
};

let errorPattern = (code, message) => {
	return {
		'code': code,
		'error': { "message": message }
	};
};

module.exports = {
	successPattern,
	errorPattern
};
