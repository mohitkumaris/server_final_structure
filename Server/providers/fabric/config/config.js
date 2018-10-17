var util = require('util');
var path = require('path');
var fabricClient = require('fabric-client');

var file = 'network-config%s.yaml';

var env = process.env.TARGET_NETWORK;
if (env)
	file = util.format(file, '-' + env);
else
	file = util.format(file, '');
console.log(__dirname)


fabricClient.setConfigSetting('network-connection-profile-path', path.join(__dirname, file));
fabricClient.setConfigSetting('Org1-connection-profile-path', path.join(__dirname, 'org1.yaml'));
fabricClient.setConfigSetting('Org2-connection-profile-path', path.join(__dirname, 'org2.yaml'));
fabricClient.addConfigFile(path.join(__dirname, 'config.json'));
