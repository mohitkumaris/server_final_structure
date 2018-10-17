'use strict';
var util = require('util');
var path = require('path');
var fabricClient = require('fabric-client');

var file = 'network-config-admin%s.yaml';

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

getClientForOrg("Org1")
    .then(client => {
        var admins = fabricClient.getConfigSetting('admins');
        let adminUserObj = client.setUserContext(
            { username: admins[0].username, password: admins[0].secret })
            .then(resp => { console.log(resp) });
    });


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

exports.getClientForOrg = getClientForOrg;