
'use strict';

var express = require('express');
var router = express.Router();
var config = require('config.json')
var fabricAPIs= require('../providers/fabric/shared/FabricAPIs')

var fabricBroker = require('../providers/fabric/FabricBroker')
var goodsService = {};

var declarations = require('../data/declarations.json');

goodsService.createDeclaration = createDeclaration;
goodsService.getDeclarations = getDeclarations;

module.exports = goodsService;

// Creating goods declaration
async function createDeclaration(declaration) {
   
    try{       

        var response = await fabricAPIs.invokeChaincode(config.peers, config.channelName, config.chaincodeName, "initMarble", [JSON.stringify(declaration)], config.username, config.orgName);
        if (!response.success) {
            response.payload = errorHandler.formatErrorResponse(response.payload);                
        }
        
        return response;
    }
    catch(err){
       throw new  Error(err)
    }                  
     
}

async function getDeclarations ( ) {
   
    try{       
        
        // var response = declarations.filter( (declaration) => declaration.authorizationId === authorizationId )
        return declarations;

    }
    catch(err){
       throw new  Error(err)
    }                  
     
}
 