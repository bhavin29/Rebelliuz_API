const _ = require('lodash');

class RequestHandler {
	constructor(logger) {
		this.logger = logger;
	}

	throwIf(fn, status, errorType, errorMessage) {
		return result => (fn(result) ? this.throwError(status, errorType, errorMessage)() : result);
	}

	validateJio(err, status, errorType, errorMessage,errorText) {
		if (err) { this.logger.log(`error in validating request : ${errorMessage}`, 'warn'); }
		return !_.isNull(err) ? this.throwError(status, errorType, errorMessage)() : '';
	}

	sendSuccess(res, message, status,data) {
		this.logger.log(`a request has been made and proccessed successfully at: ${new Date()}`, 'info');
		if (_.isUndefined(status)) {
			status = 200;
		}
		return res.status(status).json({ success: "true",  message: message, status : status,  data,
				});
	}

	sendError(req, res, status, message,error) {
		this.logger.log(`error ,Error during processing request: ${`${req.protocol}://${req.get('host')}${req.originalUrl}`} details message: ${message}`, 'error');
		return res.status(status).json({ success: "false",  message: message, status : status, error : error
				 });
 	}


	 throwError(status, errorType, errorMessage) {
		return (e) => {
			if (!e) e = new Error(errorMessage || 'Default Error');
			e.status = status;
			e.errorType = errorType;
			throw e;
		};
	}

	catchError(res, error) {
		if (!error) error = new Error('Default error');
		res.status(error.status || 500).json({ type: 'error', message: error.message || 'Unhandled error', error });
	}
}
module.exports = RequestHandler;
