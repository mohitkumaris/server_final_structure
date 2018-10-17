'use strict';

var util = require('util');
var fabricClient = require('fabric-client');
require('../config/config');
const logger = require('../../../winston')

const fabricAPIs = {}
fabricAPIs.invokeChaincode = invokeChaincode
fabricAPIs.invokeChaincode = invokeChaincode;
fabricAPIs.queryChaincode = queryChaincode;
fabricAPIs.getClientForOrg = getClientForOrg
module.exports = fabricAPIs;

async function queryChaincode(peerNames, channelName, chaincodeName, functionName, functionArgs, username, org_name) {
    var client = await getClientForOrg(org_name, username);
    logger.debug('Successfully got the fabric client for the organization "%s"', org_name);
    var channel = client.getChannel(channelName);
    if (!channel) {
        let message = util.format('Channel %s was not defined in the connection profile', channelName);
        logger.error(message);
        throw new Error(message);

    }
    const request = {
        targets : peerNames,
        chaincodeId: chaincodeName,
        fcn: functionName,
        args: functionArgs
    };

    var queryResponses = await channel.queryByChaincode(request);
    if (queryResponses && queryResponses.length == 1) {
        if (queryResponses[0] instanceof Error) {
            console.error("error from query = ", queryResponses[0]);
        } else {
            console.log("Response is ", queryResponses[0].toString());
            return JSON.parse(queryResponses[0]);
        }
    } else {
        console.log("No payloads were returned from query");
    }
    
};

async function invokeChaincode(peerNames, channelName, chaincodeName, fcn, args, username, org_name) {
    logger.debug('peers  : ' + peerNames);
    logger.debug('channelName  : ' + channelName);
    logger.debug('chaincodeName : ' + chaincodeName);
    logger.debug('fcn  : ' + fcn);
    logger.debug('args  : ' + args);
    logger.debug('organisation  : ' + org_name);
    logger.debug('username  : ' + username);

    var error_message = null;
    var tx_id_string = null;
    try {
        
        var client = await getClientForOrg(org_name, username);
        logger.debug('Successfully got the fabric client for the organization: ' + org_name);
        var channel = client.getChannel(channelName);

        if (!channel) {
            let message = util.format('Channel '  + channelName + ' was not defined in the connection profile ');
            logger.debug(message);
            throw new Error(message);
        }
        var tx_id = client.newTransactionID();
        tx_id_string = tx_id.getTransactionID();

        
        var request = {
            targets: peerNames,
            chaincodeId: chaincodeName,
            fcn: fcn,
            args: args,
            chainId: channelName,
            txId: tx_id
        };
        console.log(request)

        let results = await channel.sendTransactionProposal(request);

        // the returned object has both the endorsement results
        // and the actual proposal, the proposal will be needed
        // later when we send a transaction to the orderer
        var proposalResponses = results[0];
        var proposal = results[1];

        // lets have a look at the responses to see if they are
        // all good, if good they will also include signatures
        // required to be committed
        var all_good = true;
        for (var i in proposalResponses) {
            let one_good = false;
            if (proposalResponses && proposalResponses[i].response &&
                proposalResponses[i].response.status === 200) {
                one_good = true;
                logger.debug('invoke chaincode proposal was good');
                logger.debug("\n\n\n" + JSON.stringify(proposalResponses[i].response) + "\n\n\n");
            } else {
                logger.debug('invoke chaincode proposal was bad');
                return JSON.stringify({ "error": "invoke chaincode proposal was bad" });
            }
            all_good = all_good & one_good;
        }

        var payload;
        if (all_good) {
            logger.debug(util.format(
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message,
                proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));

            payload = util.format('%s', proposalResponses[0].response.payload)
            logger.debug("Harish 1\n\n\n" + JSON.stringify(payload) + "\n\n\n");
            // wait for the channel-based event hub to tell us
            // that the commit was good or bad on each peer in our organization
            var promises = [];
            let event_hubs = channel.getChannelEventHubsForOrg();
            event_hubs.forEach((eh) => {
                logger.debug('invokeEventPromise - setting up event');
                let invokeEventPromise = new Promise((resolve, reject) => {
                    let event_timeout = setTimeout(() => {
                        let message = 'REQUEST_TIMEOUT:' + eh.getPeerAddr();
                        logger.debug(message);
                        eh.disconnect();
                    }, 3000);
                    eh.registerTxEvent(tx_id_string, (tx, code, block_num) => {
                        logger.debug('The chaincode invoke chaincode transaction has been committed on peer %s', eh.getPeerAddr());
                        logger.debug('Transaction %s has status of %s in blocl %s', tx, code, block_num);
                        clearTimeout(event_timeout);

                        if (code !== 'VALID') {
                            let message = util.format('The invoke chaincode transaction was invalid, code:%s', code);
                            logger.debug(message);
                            reject(new Error(message));
                        } else {
                            let message = 'The invoke chaincode transaction was valid.';
                            logger.debug(message);
                            resolve(message);
                        }
                    }, (err) => {
                        clearTimeout(event_timeout);
                        logger.debug(err);
                        reject(err);
                    },
                        // the default for 'unregister' is true for transaction listeners
                        // so no real need to set here, however for 'disconnect'
                        // the default is false as most event hubs are long running
                        // in this use case we are using it only once
                        { unregister: true, disconnect: true }
                    );
                    eh.connect();
                });
                promises.push(invokeEventPromise);
            });

            var orderer_request = {
                txId: tx_id,
                proposalResponses: proposalResponses,
                proposal: proposal
            };
            var sendPromise = channel.sendTransaction(orderer_request);
            // put the send to the orderer last so that the events get registered and
            // are ready for the orderering and committing
            promises.push(sendPromise);
            let results = await Promise.all(promises);
            logger.debug(util.format('------->>> R E S P O N S E : %j', results));
            let response = results.pop(); //  orderer results are last in the results
            if (response.status === 'SUCCESS') {
                logger.debug('Successfully sent transaction to the orderer.');
            } else {
                error_message = util.format('Failed to order the transaction. Error code: %s', response.status);
                logger.debug(error_message);
            }

            // now see what each of the event hubs reported
            for (let i in results) {
                let event_hub_result = results[i];
                let event_hub = event_hubs[i];
                logger.debug('Event results for event hub :%s', event_hub.getPeerAddr());
                if (typeof event_hub_result === 'string') {
                    logger.debug(event_hub_result);
                } else {
                    if (!error_message) error_message = event_hub_result.toString();
                    logger.debug(event_hub_result.toString());
                }
            }
        } else {
            error_message = util.format('Failed to send Proposal and receive all good ProposalResponse');
            logger.debug(error_message);
        }
    } catch (error) {
        logger.debug('Failed to invoke due to error: ' + error.stack ? error.stack : error);
        error_message = error.toString();
    }

    if (!error_message) {
        /* let message = util.format(
            'Successfully invoked the chaincode %s to the channel \'%s\' for transaction ID: %s',
            org_name, channelName, tx_id_string); */

        logger.debug("messagetttttttttttttttttttttttttttttttttttttttttttttt");

        /* var response = {
            payload: payload,
            message: message
        } */
        logger.debug("Harish 2\n\n\n" + JSON.stringify(payload) + "\n\n\n");
        //return tx_id_string;
        return JSON.parse(payload);
    } else {
        let message = util.format('Failed to invoke chaincode. cause:%s', error_message);
        logger.debug(message);
        throw new Error(message);
    }
}

async function invokeChaincode(peerNames, channelName, chaincodeName, fcn, args, username, org_name) {
    logger.debug('peers  : ' + peerNames);
    logger.debug('channelName  : ' + channelName);
    logger.debug('chaincodeName : ' + chaincodeName);
    logger.debug('fcn  : ' + fcn);
    logger.debug('args  : ' + args);
    logger.debug('organisation  : ' + org_name);
    logger.debug('username  : ' + username);
    username = "admin";
    org_name = "Org1";
    var error_message = null;
    var tx_id_string = null;
    try {
        // first setup the client for this org
        var client = await getClientForOrg(org_name, username);
        logger.debug('Successfully got the fabric client for the organization "%s"', org_name);
        var channel = client.getChannel(channelName);

        if (!channel) {
            let message = util.format('Channel %s was not defined in the connection profile', channelName);
            logger.debug(message);
            throw new Error(message);
        }
        var tx_id = client.newTransactionID();
        // will need the transaction ID string for the event registration later
        tx_id_string = tx_id.getTransactionID();

        // send proposal to endorser
       
        var request = {
            targets: peerNames,
            chaincodeId: chaincodeName,
            fcn: fcn,
            args: args,
            chainId: channelName,
            txId: tx_id
        };

        logger.debug("\n\n\n" + JSON.stringify(request) + "\n\n\n");    
        let results = await channel.sendTransactionProposal(request);

        // the returned object has both the endorsement results
        // and the actual proposal, the proposal will be needed
        // later when we send a transaction to the orderer
        var proposalResponses = results[0];
        var proposal = results[1];

        // lets have a look at the responses to see if they are
        // all good, if good they will also include signatures
        // required to be committed
        var all_good = true;
        for (var i in proposalResponses) {
            let one_good = false;
            if (proposalResponses && proposalResponses[i].response &&
                proposalResponses[i].response.status === 200) {
                one_good = true;
                logger.debug('invoke chaincode proposal was good');
                logger.debug("\n\n\n" + JSON.stringify(proposalResponses[i].response) + "\n\n\n");
            } else {
                logger.debug('invoke chaincode proposal was bad');
                return JSON.stringify({ "error": "invoke chaincode proposal was bad" });
            }
            all_good = all_good & one_good;
        }

        var payload;
        if (all_good) {
            logger.debug(util.format(
                'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
                proposalResponses[0].response.status, proposalResponses[0].response.message,
                proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));

            payload = util.format('%s', proposalResponses[0].response.payload)
            logger.debug("Harish 1\n\n\n" + JSON.stringify(payload) + "\n\n\n");
            // wait for the channel-based event hub to tell us
            // that the commit was good or bad on each peer in our organization
            var promises = [];
            let event_hubs = channel.getChannelEventHubsForOrg();
            event_hubs.forEach((eh) => {
                logger.debug('invokeEventPromise - setting up event');
                let invokeEventPromise = new Promise((resolve, reject) => {
                    let event_timeout = setTimeout(() => {
                        let message = 'REQUEST_TIMEOUT:' + eh.getPeerAddr();
                        logger.debug(message);
                        eh.disconnect();
                    }, 3000);
                    eh.registerTxEvent(tx_id_string, (tx, code, block_num) => {
                        logger.debug('The chaincode invoke chaincode transaction has been committed on peer %s', eh.getPeerAddr());
                        logger.debug('Transaction %s has status of %s in blocl %s', tx, code, block_num);
                        clearTimeout(event_timeout);

                        if (code !== 'VALID') {
                            let message = util.format('The invoke chaincode transaction was invalid, code:%s', code);
                            logger.debug(message);
                            reject(new Error(message));
                        } else {
                            let message = 'The invoke chaincode transaction was valid.';
                            logger.debug(message);
                            resolve(message);
                        }
                    }, (err) => {
                        clearTimeout(event_timeout);
                        logger.debug(err);
                        reject(err);
                    },
                        // the default for 'unregister' is true for transaction listeners
                        // so no real need to set here, however for 'disconnect'
                        // the default is false as most event hubs are long running
                        // in this use case we are using it only once
                        { unregister: true, disconnect: true }
                    );
                    eh.connect();
                });
                promises.push(invokeEventPromise);
            });

            var orderer_request = {
                txId: tx_id,
                proposalResponses: proposalResponses,
                proposal: proposal
            };
            var sendPromise = channel.sendTransaction(orderer_request);
            // put the send to the orderer last so that the events get registered and
            // are ready for the orderering and committing
            promises.push(sendPromise);
            let results = await Promise.all(promises);
            logger.debug(util.format('------->>> R E S P O N S E : %j', results));
            let response = results.pop(); //  orderer results are last in the results
            if (response.status === 'SUCCESS') {
                logger.debug('Successfully sent transaction to the orderer.');
            } else {
                error_message = util.format('Failed to order the transaction. Error code: %s', response.status);
                logger.debug(error_message);
            }

            // now see what each of the event hubs reported
            for (let i in results) {
                let event_hub_result = results[i];
                let event_hub = event_hubs[i];
                logger.debug('Event results for event hub :%s', event_hub.getPeerAddr());
                if (typeof event_hub_result === 'string') {
                    logger.debug(event_hub_result);
                } else {
                    if (!error_message) error_message = event_hub_result.toString();
                    logger.debug(event_hub_result.toString());
                }
            }
        } else {
            error_message = util.format('Failed to send Proposal and receive all good ProposalResponse');
            logger.debug(error_message);
        }
    } catch (error) {
        logger.debug('Failed to invoke due to error: ' + error.stack ? error.stack : error);
        error_message = error.toString();
    }

    if (!error_message) {
        /* let message = util.format(
            'Successfully invoked the chaincode %s to the channel \'%s\' for transaction ID: %s',
            org_name, channelName, tx_id_string); */

        logger.debug("messagetttttttttttttttttttttttttttttttttttttttttttttt");

        /* var response = {
            payload: payload,
            message: message
        } */
        logger.debug("Harish 2\n\n\n" + JSON.stringify(payload) + "\n\n\n");
        //return tx_id_string;
        return JSON.parse(payload);
    } else {
        let message = util.format('Failed to invoke chaincode. cause:%s', error_message);
        logger.debug(message);
        throw new Error(message);
    }
};


async function getClientForOrg(userorg, username) {
    logger.debug('getClientForOrg - ****** START %s %s', userorg, username)
    let config = '-connection-profile-path';
    let client = fabricClient.loadFromConfig(fabricClient.getConfigSetting('network' + config));
    client.loadFromConfig(fabricClient.getConfigSetting(userorg + config));
    await client.initCredentialStores();
    if (username) {
        let user = await client.getUserContext(username, true);
        if (!user) {
            throw new Error(util.format('User was not found :', username));
        } else {
            logger.debug('User %s was found to be registered and enrolled', username);
        }
    }
    logger.debug('getClientForOrg - ****** END %s %s \n\n', userorg, username)

    return client;
}
