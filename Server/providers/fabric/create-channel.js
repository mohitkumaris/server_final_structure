'use strict';
var util = require('util');
var path = require('path');
var fabricClient = require('fabric-client');
const logger = require('../../winston')
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

var util = require('util');
var fs = require('fs');

var channelName = "mychannel"
var channelConfigPath = "./artifacts/channel/mychannel.tx";
var username = "admin";
var org_name = "Org1";

createChannel(channelName, channelConfigPath, username, org_name)
	.then(data => console.log(data)).catch(err => console.log(err));

async function createChannel(channelName, channelConfigPath, username, orgName) {
	logger.debug('\n====== Creating Channel \'' + channelName + '\' ======\n');
	try {
		var client = await getClientForOrg(orgName);
		logger.debug('Successfully got the fabric client for the organization "%s"', orgName);
		var envelope = fs.readFileSync(path.join(__dirname, channelConfigPath));
		var channelConfig = client.extractChannelConfig(envelope);
		let signature = client.signChannelConfig(channelConfig);

		let request = {
			config: channelConfig,
			signatures: [signature],
			name: channelName,
			txId: client.newTransactionID(true) 
		};

		var response = await client.createChannel(request)
		logger.debug('\n\nhere\n\n')
		logger.debug(' response ::%j', response);
		if (response && response.status === 'SUCCESS') {
			logger.debug('Successfully created the channel.');
			let response = {
				success: true,
				message: 'Channel \'' + channelName + '\' created Successfully'
			};
			return response;
		} else {
			logger.error('\n!!!!!!!!! Failed to create the channel \'' + channelName +
				'\' !!!!!!!!!\n\n');
			throw new Error('Failed to create the channel \'' + channelName + '\'');
		}
	} catch (err) {
		logger.error('Failed to initialize the channel: ' + err.stack ? err.stack : err);
		throw new Error('Failed to initialize the channel: ' + err.toString());
	}
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

exports.createChannel = createChannel;
