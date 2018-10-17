
'use strict';

var config = require('config.json')
var fabricAPIs= require('../providers/fabric/shared/FabricAPIs')

var fabricBroker = require('../providers/fabric/FabricBroker')
var alertService = {};

var alerts = require('../data/alerts.json');

alertService.getAlerts = getAlerts;

module.exports = alertService;

//Get Alerts
async function getAlerts (  ) {
   
    try{       
        
        // var response = declarations.filter( (declaration) => declaration.authorizationId === authorizationId )
        return alerts;

    }
    catch(err){
       throw new  Error(err)
    }                  
     
}
 