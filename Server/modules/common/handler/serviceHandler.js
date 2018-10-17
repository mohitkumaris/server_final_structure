const City = require('../data/city.json'),
CompanyType = require('../data/companyType.json'),
Services =  require('../data/service.json');

module.exports = {

    getCity :  function(){
      return  Promise.resolve(City);
    },

    getCompanyType : function(){
      return  Promise.resolve(CompanyType);
    }, 

    getServices : function(){
     return   Promise.resolve(Services);
    },

    getAll:  function(){
       return Promise.resolve({
            City  : City,
            CompanyType :  CompanyType,
            Services  : Services
        });
    }

}