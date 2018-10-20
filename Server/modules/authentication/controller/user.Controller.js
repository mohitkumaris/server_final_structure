const  UserLoginHandler  =  require('../handler/userLogin.Handler'),
sharedEnums  = require('../../common/sharedEnums'),
ErrorHandler = require('../../common/handler/errorHandler'),
ResponseHandler = require('../../common/handler/responseHandler');

module.exports  = {

    CheckUserNameAvailability  : function(req,res){
        UserLoginHandler.CheckUserNameAvailability(req.body).then((response)=>{
            ResponseHandler.sendResponse(res,sharedEnums.responseCode.SUCCESS,response);
        }).catch((err)=>{
            ErrorHandler.sendResponse(res,sharedEnums.responseCode.SERVERERROR,{errorCode :  err,message : err});
        });
    },

    RegisterNewUser : function(req,res){
            UserLoginHandler.RegisterNewUser(req.body).then((response)=>{
                ResponseHandler.sendResponse(res,sharedEnums.responseCode.SUCCESS,response);
            })
            .catch((err)=>{
                ErrorHandler.sendResponse(res,sharedEnums.responseCode.SERVERERROR,{errorCode :  err,message : err});
            })
    }



}