
class  ErrorHandler{
    static  sendResponse(res,status,response){
        res.status(status).send({ errorCode : response.errorCode || '00', message : response.message || 'Something went  wrong'});
    }
}

module.exports =  ErrorHandler;