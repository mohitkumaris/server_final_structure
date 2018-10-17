class ResponseHandler {


   static  sendResponse(res,status,response){
        res.status(status).send({ body : response});
    }
}

module.exports  = ResponseHandler;