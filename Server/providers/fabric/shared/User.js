'use strict';
const
    User = {},
    logger = require('../../../winston');

var fabricAPIs = require('./FabricAPIs');
var errorHandler = require('./ErrorHandler');

var peers = ["peer0.org1.example.com"];
var channelName = "mychannel";
var chaincodeName = "user1";
var username = "admin"
var orgName = "Org1"

async function register(product) {

    logger.debug("In fabric broker - register user");
    var response = await fabricAPIs.invokeChaincode(peers, channelName, chaincodeName, "register", [JSON.stringify(product)], username, orgName);
    logger.debug("\nFrom Fabric API" + JSON.stringify(response));
    if (response.success) {
        return response;
    } else {
        response.payload = errorHandler.formatErrorResponse(response.payload);
        logger.debug("\nFrom Updated Response" + JSON.stringify(response));
        return response;
    }
}

/* async function login() {

    logger.debug("In fabric broker - login user");
    var response = await fabricAPIs.queryChaincode(peers, channelName, chaincodeName, "login", [], username, orgName);
    logger.debug("\nFrom Fabric API" + JSON.stringify(response));
    if (response.success) {
        return JSON.parse(response.payload)
    } else {
        response.payload = errorHandler.formatErrorResponse(response.payload)
        logger.debug("\nFrom Updated Response" + JSON.stringify(response));
        return response.payload
    }

}

User.login = login */
User.register = register
module.exports = User;