'use strict';
const
    Marble = {};
    var logger = require('../../../winston');
    var fabricAPIs = require('./FabricAPIs');
    var errorHandler = require('./ErrorHandler');
    var config = require('config.json');
Marble.createMarble = createMarble

/* const customer = {
    customerId: "cust1",
    corporation: "Diamler",
    contactPerson: "ABC",
    address: "Frankfurt, Germany",
    industry: "Automotive"
} */

async function createMarble(marble) {
//Name: 'Marble1', Color: 'Red', Size: '25', Owner: 'Divyam'
    //loan={"syndicateId": "syndicateId323","leadMemberId": "4","customerId": "customerId","termSheet":{"loanAmount": "20000","ContractConclusionDate": "ContractConclusionDate","termStartDate": "termStartDate","termEndDate": "termEndDate","monthlyRepayDate": "monthlyRepayDate"},"syndicateTerms":[{"syndicateMemberId": "4","loanShareAmount": "2000","LoanSharePer": "10","interestRate": "interestRate","leadMemberFee": "leadMemberFee","otherFees": "otherFees","status": "status"}],"currentStatus": "currentStatus"}
    logger.debug("In fabric broker - initMarble");
    var response = await fabricAPIs.invokeChaincode(config.peers, config.channelName, config.chaincodeName, "initMarble",
        [marble.Name, marble.Color, marble.Size, marble.Owner ], config.username, config.orgName);

    logger.debug("\nFrom Fabric API" + JSON.stringify(response));
    if (!response.success) {
        response.payload = errorHandler.formatErrorResponse(response.payload);
        logger.debug("\nFrom Updated Response" + JSON.stringify(response));
    }
    return response;
}




module.exports = Marble ;