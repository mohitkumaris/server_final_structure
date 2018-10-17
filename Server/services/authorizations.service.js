
'use strict';

var config = require('config.json')
var fabricAPIs= require('../providers/fabric/shared/FabricAPIs')

var fabricBroker = require('../providers/fabric/FabricBroker')
var authorizationService = {};

var authorizations = require('../data/authorization.json');

authorizationService.getAuthorizations = getAuthorizations;

module.exports = authorizationService;

//Get Authorizations
async function getAuthorizations (  ) {
   
    try{       
        
        // var response = declarations.filter( (declaration) => declaration.authorizationId === authorizationId )
        return authorizations;

    }
    catch(err){
       throw new  Error(err)
    }                  
     
}
 