
'use strict';

	var express = require('express');
	var router = express.Router();
const
	logger = require('../winston'),	
	fabricBroker = require('../providers/fabric/FabricBroker'),
	MarbleService = {};

	// router.post('/test', createMarble);
    MarbleService.createMarble = createMarble;

module.exports = MarbleService;

// Storing loan information on chain
async function createMarble(loan) {
	try {
		var resp = await fabricBroker.createMarble(loan);
		logger.debug("Marble service" + JSON.stringify(resp));
		return resp;
	} catch (err) {
		logger.debug(err)
		return err;
	}
}




