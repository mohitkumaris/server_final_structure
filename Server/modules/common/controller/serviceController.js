const sharedEnums  = require('../sharedEnums'),
ServiceHandler = require('../handler/serviceHandler'),
ErrorHandler = require('..//handler/errorHandler'),
ResponseHandler = require('..//handler/responseHandler');


module.exports = {

    GetCity : function(req,res){
        ServiceHandler.getCity().then((response)=>{
            ResponseHandler.sendResponse(res,sharedEnums.responseCode.SUCCESS,response);
        }) .catch((err)=>{   
            ErrorHandler.sendResponse(res,sharedEnums.responseCode.SERVERERROR,{errorCode :  err});
        })
    },

    GetCompanyType :  (req,res)=>{
        ServiceHandler.getCompanyType().then((response)=>{
            ResponseHandler.sendResponse(res,sharedEnums.responseCode.SUCCESS,response);
        }) .catch((err)=>{   
            ErrorHandler.sendResponse(res,sharedEnums.responseCode.SERVERERROR,{errorCode :  err});
        })
    },

    GetServices : (req,res)=>{
        ServiceHandler.getServices().then((response)=>{
            ResponseHandler.sendResponse(res,sharedEnums.responseCode.SUCCESS,response);
        }) .catch((err)=>{   
            ErrorHandler.sendResponse(res,sharedEnums.responseCode.SERVERERROR,{errorCode :  err});
        })
    },

    GetAll : (req,res) =>{
        ServiceHandler.getAll().then((response)=>{
            ResponseHandler.sendResponse(res,sharedEnums.responseCode.SUCCESS,response);
        }) .catch((err)=>{   
            ErrorHandler.sendResponse(res,sharedEnums.responseCode.SERVERERROR,{errorCode :  err});
        })
    }

}