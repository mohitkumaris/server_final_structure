
'use strict';
var path = require('path');
var fs = require('fs');
var util = require('util');
var hfc = require('fabric-client');
var helper = require('./enrollAdmin');


require('./config/config');

var peers = ["peer0.org1.example.com"];
var channelName = "mychannel"
/* var chaincodeName = "patient1";
var functionName = "getCustomerById"
var patient = "323412341234"; */
/*var functionName = "addPatient"
var patient = { "patientId": "323412341234" , "docList": [{
	"docID" :"123",
	"docName" : "test",
	"docType" : "pres",
	"docHash" : "hash",
	"docCreatedBy": "admin"
}] };*/

var chaincodeName = "sssc";
var functionName = "createWorkflow"
var patient = { userId: "harish", password: "1234" };


var username = "admin";
var orgName = "Org1";

var product1 = {
	"workflowId": "workflowId2",
	"workflowName": "workflowName",
	"workflowActors": [
		{
			"userId": "userId",
			"role": "role"
		}
	],
	"lastModified": 12,
	"lastModifiedBy": "lastModifiedBy"
}
var args = [JSON.stringify(product1)]




invokeChaincode(peers, channelName, chaincodeName, functionName, args, username, orgName)
	.then(data => console.log(data)).catch(err => console.log(err));

async function invokeChaincode(peerNames, channelName, chaincodeName, fcn, args, username, org_name) {

	console.log("#########Inside Invoke##########################")

	console.log('peers  : ' + peerNames);
	console.log('channelName  : ' + channelName);
	console.log('chaincodeName : ' + chaincodeName);
	console.log('fcn  : ' + fcn);
	console.log('args  : ' + args);
	console.log('organisation  : ' + org_name);
	console.log('username  : ' + username);
	username = "admin";
	org_name = "Org1";

	var error_message = null;
	var tx_id_string = null;
	try {
		// first setup the client for this org
		var client = await helper.getClientForOrg(org_name, username);
		console.log('Successfully got the fabric client for the organization "%s"', org_name);
		var channel = client.getChannel(channelName);

		if (!channel) {
			let message = util.format('Channel %s was not defined in the connection profile', channelName);
			console.log(message);
			throw new Error(message);
		}
		var tx_id = client.newTransactionID();
		// will need the transaction ID string for the event registration later
		tx_id_string = tx_id.getTransactionID();

		// send proposal to endorser
		console.log("###################################")
		var request = {
			targets: peerNames,
			chaincodeId: chaincodeName,
			fcn: fcn,
			args: args,
			chainId: channelName,
			txId: tx_id
		};
		console.log("###############test")
		console.log("\n\n\n" + JSON.stringify(request) + "\n\n\n");
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
				console.log('invoke chaincode proposal was good');
				console.log("\n\n\n" + JSON.stringify(proposalResponses[i].response) + "\n\n\n");
			} else {
				console.log('invoke chaincode proposal was bad');
				return JSON.stringify({ "error": "invoke chaincode proposal was bad" });
			}
			all_good = all_good & one_good;
		}

		var payload;
		if (all_good) {
			console.log(util.format(
				'Successfully sent Proposal and received ProposalResponse: Status - %s, message - "%s", metadata - "%s", endorsement signature: %s',
				proposalResponses[0].response.status, proposalResponses[0].response.message,
				proposalResponses[0].response.payload, proposalResponses[0].endorsement.signature));

			payload = util.format('%s', proposalResponses[0].response.payload)

			// wait for the channel-based event hub to tell us
			// that the commit was good or bad on each peer in our organization
			var promises = [];
			let event_hubs = channel.getChannelEventHubsForOrg();
			event_hubs.forEach((eh) => {
				console.log('invokeEventPromise - setting up event');
				let invokeEventPromise = new Promise((resolve, reject) => {
					let event_timeout = setTimeout(() => {
						let message = 'REQUEST_TIMEOUT:' + eh.getPeerAddr();
						console.log(message);
						eh.disconnect();
					}, 3000);
					eh.registerTxEvent(tx_id_string, (tx, code, block_num) => {
						console.log('The chaincode invoke chaincode transaction has been committed on peer %s', eh.getPeerAddr());
						console.log('Transaction %s has status of %s in blocl %s', tx, code, block_num);
						clearTimeout(event_timeout);

						if (code !== 'VALID') {
							let message = util.format('The invoke chaincode transaction was invalid, code:%s', code);
							console.log(message);
							reject(new Error(message));
						} else {
							let message = 'The invoke chaincode transaction was valid.';
							console.log(message);
							resolve(message);
						}
					}, (err) => {
						clearTimeout(event_timeout);
						console.log(err);
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
			console.log(util.format('------->>> R E S P O N S E : %j', results));
			let response = results.pop(); //  orderer results are last in the results
			if (response.status === 'SUCCESS') {
				console.log('Successfully sent transaction to the orderer.');
			} else {
				error_message = util.format('Failed to order the transaction. Error code: %s', response.status);
				console.log(error_message);
			}

			// now see what each of the event hubs reported
			for (let i in results) {
				let event_hub_result = results[i];
				let event_hub = event_hubs[i];
				console.log('Event results for event hub :%s', event_hub.getPeerAddr());
				if (typeof event_hub_result === 'string') {
					console.log(event_hub_result);
				} else {
					if (!error_message) error_message = event_hub_result.toString();
					console.log(event_hub_result.toString());
				}
			}
		} else {
			error_message = util.format('Failed to send Proposal and receive all good ProposalResponse');
			console.log(error_message);
		}
	} catch (error) {
		console.log('Failed to invoke due to error: ' + error.stack ? error.stack : error);
		error_message = error.toString();
	}

	if (!error_message) {
		let message = util.format(
			'Successfully invoked the chaincode %s to the channel \'%s\' for transaction ID: %s',
			org_name, channelName, tx_id_string);


		//return tx_id_string;
		return payload;
	} else {
		let message = util.format('Failed to invoke chaincode. cause:%s', error_message);
		console.log(message);
		throw new Error(message);
	}


};

exports.invokeChaincode = invokeChaincode;