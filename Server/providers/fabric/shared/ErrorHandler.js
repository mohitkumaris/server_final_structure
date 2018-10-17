'use strict';

const
	ErrorHandler = {},
	messages = require('../config/messages.json'),
	logger = require('../../../winston');

ErrorHandler.formatErrorResponse = formatErrorResponse

function formatErrorResponse(payload) {
	var newPayload = {}
	logger.debug("In fabric broker - formatErrorResponse");
	logger.debug(messages);
	newPayload.messageCode = payload.messageCode;
	newPayload.message = messages.chaincode[payload.messageCode].message;
	newPayload.severity = messages.chaincode[payload.messageCode].severity;
	return newPayload;
}

module.exports = ErrorHandler;