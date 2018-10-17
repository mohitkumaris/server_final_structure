'use strict';
var util = require('util');
var path = require('path');
var fabricClient = require('fabric-client');
//const logger = require('../../winston')
var file = 'network-config-admin%s.yaml';
var tx_id = null;

var env = process.env.TARGET_NETWORK;
if (env)
	file = util.format(file, '-' + env);
else
	file = util.format(file, '');
console.log(__dirname)
var dirname = __dirname + "/config"

fabricClient.setConfigSetting('network-connection-profile-path', path.join(dirname, file));
fabricClient.setConfigSetting('Org1-connection-profile-path', path.join(dirname, 'org1.yaml'));
fabricClient.setConfigSetting('Org2-connection-profile-path', path.join(dirname, 'org2.yaml'));
fabricClient.addConfigFile(path.join(dirname, 'config.json'));

var fabricClient = require('fabric-client');

var peers = ["peer0.org1.example.com"];
var chaincodeName = "marbles_cc";
var chaincodePath = "github.com/marbles_cc";
var chaincodeVersion = "v0";
var chaincodeType = "go";
var username = "admin";
var orgName = "Org1";

installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, chaincodeType, username, orgName)
	.then(data => console.log(data)).catch(err => console.log(err));


async function installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, chaincodeType, username, org_name) {
	//logger.debug('\n\n============ Install chaincode on organizations ============\n');
	setupChaincodeDeploy();
	let error_message = null;
	try {
		//logger.info('Calling peers in organization "%s" to join the channel', org_name);

		// first setup the client for this org
		var client = await getClientForOrg(org_name, username);
		//logger.debug('Successfully got the fabric client for the organization "%s"', org_name);

		tx_id = client.newTransactionID(true); //get an admin transactionID
		var request = {
			targets: peers,
			chaincodePath: chaincodePath,
			chaincodeId: chaincodeName,
			chaincodeVersion: chaincodeVersion,
			chaincodeType: chaincodeType
		};
		let results = await client.installChaincode(request);
		// the returned object has both the endorsement results
		// and the actual proposal, the proposal will be needed
		// later when we send a transaction to the orederer
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
				//logger.info('install proposal was good');
			} else {
				//logger.error('install proposal was bad %j', proposalResponses.toJSON());
			}
			all_good = all_good & one_good;
		}
		if (all_good) {
			//logger.info('Successfully sent install Proposal and received ProposalResponse');
		} else {
			error_message = 'Failed to send install Proposal or receive valid response. Response null or status is not 200'
			//logger.error(error_message);
		}
	} catch (error) {
		//logger.error('Failed to install due to error: ' + error.stack ? error.stack : error);
		error_message = error.toString();
	}

	if (!error_message) {
		let message = util.format('Successfully install chaincode');
		//logger.info(message);
		// build a response to send back to the REST caller
		let response = {
			success: true,
			message: message
		};
		return response;
	} else {
		let message = util.format('Failed to install due to:%s', error_message);
		//logger.error(message);
		throw new Error(message);
	}
};

function setupChaincodeDeploy(){
	process.env.GOPATH = path.join(__dirname, fabricClient.getConfigSetting('CC_SRC_PATH'));
};

async function getClientForOrg(userorg, username) {
    console.log('getClientForOrg - ****** START %s %s', userorg, username)
    let config = '-connection-profile-path';
	let client = fabricClient.loadFromConfig(fabricClient.getConfigSetting('network' + config));	

	client.loadFromConfig(fabricClient.getConfigSetting(userorg + config));
	
    await client.initCredentialStores();
    if (username) {
        let user = await client.getUserContext(username, true);
        if (!user) {
            throw new Error(util.format('User was not found :', username));
        } else {
            console.log('User %s was found to be registered and enrolled', username);
        }
    }
    console.log('getClientForOrg - ****** END %s %s \n\n', userorg, username)

    return client;
}
