const  DbModel  =  require('../models/userLogin'),
SharedEnums =  require('../../common/sharedEnums');
module.exports =  {

    CheckUserNameAvailability : function(model){
        return new  Promise((resolve,reject)=>{
            DbModel.find({
                username : model.username, 
                status  : SharedEnums.UserStatus['ACTIVE']
             }).then((response)=>{
                    return  resolve(response.length> 0? false : true);
             }).catch((err)=>{
                 return  reject(SharedEnums.errorMesaageCode['DATABASEERROR']);
             })
        });
        
    },

    RegisterNewUser  : function(model){
        var dbmodel  = new DbModel();
        dbmodel.username  = model.username || '';
        dbmodel.passord  = model.passord || '';
        dbmodel.fName = model.fName || '';
        dbmodel.lName  = model.lName  || '';
        dbmodel.avator  =  model.avator  || SharedEnums.noImage; 
        dbmodel.status =  SharedEnums.UserStatus.ACTIVE;
        dbmodel.changePassword =  false;

       return dbmodel.save().then((response)=>{
            return  Promise.resolve(response);
        }).catch((err)=>{
            return Promise.reject(SharedEnums.errorMesaageCode['DATABASEERROR']);
        });    
    }

}